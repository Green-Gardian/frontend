import { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import io from 'socket.io-client';
import { SOCKET_URL } from "@/config/api";

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

      // Create actual Socket.IO connection
      socketRef.current = io(url || SOCKET_URL, {
        auth: {
          token: token,
        },
        autoConnect: true,
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to unified WebSocket server');
        setIsConnected(true);
        setError(null);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err);
        setError('Failed to connect to WebSocket server');
        setIsConnected(false);
      });

      // Force-logout: society blocked by super admin
      socketRef.current.on('force-logout', (data) => {
        console.warn('Force logout received:', data?.reason);
        socketRef.current?.disconnect();
        // Clear all auth cookies
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const name = cookie.split('=')[0].trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
        window.location.href = '/signin?reason=society_blocked';
      });

      // Listen for any message
      socketRef.current.onAny((event, data) => {
        setLastMessage({ event, data });
      });

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

  const emit = (event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event');
    }
  };

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
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
    emit,
    on,
    off,
    connect,
    disconnect,
    socket: socketRef.current
  };
};

// Hook specifically for alert notifications
export const useAlertWebSocket = () => {
  const [alerts, setAlerts] = useState([]);
  const { isConnected, lastMessage, error, on, off } = useWebSocket(
    SOCKET_URL
  );

  useEffect(() => {
    if (lastMessage && lastMessage.event) {
      switch (lastMessage.event) {
        case 'new-alert':
        case 'personal-alert':
          if (lastMessage.data && typeof lastMessage.data === 'object' && lastMessage.data.id) {
            setAlerts(prev => [lastMessage.data, ...prev].slice(0, 5)); // Keep only last 5 alerts
          }
          break;
        case 'alert-updated':
          if (lastMessage.data && typeof lastMessage.data === 'object' && lastMessage.data.id) {
            setAlerts(prev => 
              prev.map(alert => 
                alert.id === lastMessage.data.id ? lastMessage.data : alert
              )
            );
          }
          break;
        case 'alert-cancelled':
          if (lastMessage.data && lastMessage.data.id) {
            setAlerts(prev => 
              prev.filter(alert => alert.id !== lastMessage.data.id)
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

// Hook specifically for chat functionality
export const useChatWebSocket = () => {
  const { isConnected, error, emit, lastMessage, socket } = useWebSocket(SOCKET_URL);

  const joinRoom = (chatId, userId) => {
    emit('joinRoom', { chatId, userId });
  };

  const sendMessage = (chatId, content) => {
    emit('message', { chatId, content });
  };

  return {
    isConnected,
    error,
    lastMessage,   // reactive — triggers re-render on every socket event
    joinRoom,
    sendMessage,
    socket,
  };
};
