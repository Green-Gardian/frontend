import { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';

export const useWebSocket = (url) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = () => {
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Mock WebSocket connection for now
      // This prevents the console errors while we set up proper Socket.io
      console.log('Mock WebSocket: Connection established (real-time features disabled)');
      setIsConnected(true);
      setError(null);
      
      // Simulate a successful connection without actual WebSocket
      // This allows the alerts page to work normally
      
    } catch (err) {
      setError('Failed to create WebSocket connection');
      console.error('WebSocket connection error:', err);
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
  };

  const sendMessage = (message) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message', message);
    } else {
      console.warn('Socket not connected, cannot send message');
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [url]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    connect,
    disconnect
  };
};

// Hook specifically for alert notifications
export const useAlertWebSocket = () => {
  const [alerts, setAlerts] = useState([]);
  const { isConnected, lastMessage, error } = useWebSocket(
    import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:3001'
  );

  useEffect(() => {
    if (lastMessage && lastMessage.type) {
      switch (lastMessage.type) {
        case 'alert_created':
          if (lastMessage.alert && typeof lastMessage.alert === 'object' && lastMessage.alert.id) {
            setAlerts(prev => [lastMessage.alert, ...prev].slice(0, 5)); // Keep only last 5 alerts
          }
          break;
        case 'alert_updated':
          if (lastMessage.alert && typeof lastMessage.alert === 'object' && lastMessage.alert.id) {
            setAlerts(prev => 
              prev.map(alert => 
                alert.id === lastMessage.alert.id ? lastMessage.alert : alert
              )
            );
          }
          break;
        case 'alert_cancelled':
          if (lastMessage.alertId) {
            setAlerts(prev => 
              prev.filter(alert => alert.id !== lastMessage.alertId)
            );
          }
          break;
      }
    }
  }, [lastMessage]);

  const removeAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return {
    alerts,
    isConnected,
    error,
    removeAlert
  };
};
