import { useState, useEffect, useRef, useCallback } from 'react';
import socketService from '../services/socketService';
import { API_BASE_URL } from "@/config/api";

const BACKEND_URL = API_BASE_URL;

const STATUS_COLORS = {
  idle:     'bg-gray-400',
  filling:  'bg-blue-500',
  warning:  'bg-yellow-500',
  critical: 'bg-orange-500',
  full:     'bg-red-600',
};

const ALERT_COLORS = {
  warning:  'border-yellow-400 bg-yellow-50 text-yellow-800',
  critical: 'border-orange-500 bg-orange-50 text-orange-800',
  full:     'border-red-600 bg-red-50 text-red-800',
};

export default function MockBinTester() {
  const [bin, setBin]               = useState(null);
  const [running, setRunning]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [notifLog, setNotifLog]     = useState([]);
  const [notifPerm, setNotifPerm]   = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const logEndRef = useRef(null);

  // Request browser notification permission on first render
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(p => setNotifPerm(p));
    }
  }, []);

  // Poll status on mount to reflect any already-running simulation
  useEffect(() => {
    fetchStatus();
  }, []);

  // Subscribe to socket events
  useEffect(() => {
    const handleBinsUpdate = (updatedBins) => {
      const mock = Array.isArray(updatedBins)
        ? updatedBins.find(b => b.name === '__mock_test_bin__')
        : null;
      if (mock) setBin(mock);
    };

    const handleBinAlert = (data) => {
      const entry = {
        id:        Date.now(),
        type:      data.type,
        title:     data.title,
        message:   data.message,
        fillLevel: data.fillLevel,
        time:      new Date().toLocaleTimeString(),
      };
      setNotifLog(prev => [entry, ...prev].slice(0, 20));
    };

    const handleComplete = (data) => {
      setRunning(false);
      setNotifLog(prev => [{
        id:      Date.now(),
        type:    'done',
        title:   '✅ Simulation Complete',
        message: data.message,
        time:    new Date().toLocaleTimeString(),
      }, ...prev].slice(0, 20));
    };

    socketService.on('bins:update',            handleBinsUpdate);
    socketService.on('bin:alert',              handleBinAlert);
    socketService.on('bin:simulation:complete', handleComplete);

    return () => {
      socketService.off('bins:update',            handleBinsUpdate);
      socketService.off('bin:alert',              handleBinAlert);
      socketService.off('bin:simulation:complete', handleComplete);
    };
  }, []);

  // Auto-scroll notification log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notifLog]);

  const fetchStatus = useCallback(async () => {
    try {
      const res  = await fetch(`${BACKEND_URL}/mock/bin/status`);
      const json = await res.json();
      if (json.success) {
        setBin(json.data.bin);
        setRunning(json.data.running);
      }
    } catch (err) {
      console.error('[MockBinTester] fetchStatus error:', err);
    }
  }, []);

  const handleStart = async () => {
    setLoading(true);
    setNotifLog([]);
    try {
      const res  = await fetch(`${BACKEND_URL}/mock/bin/start`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setBin(json.data);
        setRunning(true);
      }
    } catch (err) {
      console.error('[MockBinTester] start error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BACKEND_URL}/mock/bin/stop`, { method: 'POST' });
      const json = await res.json();
      if (json.success) setRunning(false);
    } catch (err) {
      console.error('[MockBinTester] stop error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fillLevel  = parseFloat(bin?.fill_level ?? 0);
  const binStatus  = bin?.status ?? 'idle';
  const barColor   = STATUS_COLORS[binStatus] ?? 'bg-gray-400';
  const isConnected = socketService.isSocketConnected();

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Mock Bin Tester</h2>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isConnected ? '● Socket connected' : '○ Socket disconnected'}
        </span>
      </div>

      {/* Notification permission banner */}
      {notifPerm !== 'granted' && notifPerm !== 'unsupported' && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
          {notifPerm === 'denied'
            ? '🔕 Browser notifications are blocked. Enable them in your browser settings to test push alerts.'
            : '🔔 Grant browser notification permission to receive push alerts.'}
        </div>
      )}

      {/* Bin status card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Bin ID</p>
            <p className="font-mono text-sm text-gray-700">{bin ? `#${bin.id}` : '—'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold text-white ${barColor}`}>
              {binStatus.toUpperCase()}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Simulation</p>
            <span className={`text-xs font-semibold ${running ? 'text-green-600' : 'text-gray-400'}`}>
              {running ? '▶ RUNNING' : '■ STOPPED'}
            </span>
          </div>
        </div>

        {/* Fill level bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Fill Level</span>
            <span className="font-semibold">{fillLevel.toFixed(0)}%</span>
          </div>
          <div className="w-full h-5 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${fillLevel}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span className="text-yellow-600">⚠ 60%</span>
            <span className="text-orange-600">🔴 80%</span>
            <span className="text-red-600">🚫 100%</span>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-xs text-gray-400">
          Fills +5% every 5s &rarr; alerts at 60% (warning), 80% (critical), 100% (full).
          Browser push notification fires at each threshold.
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={handleStart}
          disabled={loading || running}
          className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading && !running ? 'Starting…' : '▶ Start Simulation'}
        </button>
        <button
          onClick={handleStop}
          disabled={loading || !running}
          className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading && running ? 'Stopping…' : '■ Stop Simulation'}
        </button>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          title="Refresh status"
        >
          ↻
        </button>
      </div>

      {/* Notification log */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-700">Push Notification Log</p>
          {notifLog.length > 0 && (
            <button
              onClick={() => setNotifLog([])}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>

        <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
          {notifLog.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-6">
              No notifications yet — start the simulation above.
            </p>
          ) : (
            notifLog.map(entry => (
              <div
                key={entry.id}
                className={`px-4 py-3 border-l-4 ${ALERT_COLORS[entry.type] ?? 'border-gray-300 bg-white text-gray-700'}`}
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm font-semibold">{entry.title}</p>
                  <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{entry.time}</span>
                </div>
                <p className="text-xs mt-0.5">{entry.message}</p>
                {entry.fillLevel !== undefined && (
                  <p className="text-xs mt-0.5 opacity-60">Fill level: {entry.fillLevel}%</p>
                )}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
