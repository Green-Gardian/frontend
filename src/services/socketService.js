import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventHandlers = new Map();
  }

  /**
   * Initialize socket connection with JWT authentication
   */
  connect(authToken, userId, societyId, role) {
    if (this.isConnected && this.socket) {
      console.log('⚠️ Socket already connected');
      return;
    }

    try {
      console.log('✅ Connecting to socket at:', SOCKET_URL);
      console.log('🔐 User:', userId, '| Role:', role, '| Society:', societyId);

      this.socket = io(SOCKET_URL, {
        auth: {
          token: authToken
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      });

      // ============ CONNECTION EVENTS ============

      this.socket.on('connect', () => {
        console.log('✅ Frontend Socket connected:', this.socket.id);
        this.isConnected = true;

        // Authenticate user for alert system
        this.socket.emit('authenticate', {
          userId,
          societyId,
          role
        });
      });

      this.socket.on('authenticated', (data) => {
        console.log('✅ Socket authenticated:', data);
      });

      this.socket.on('auth-error', (error) => {
        console.error('❌ Socket authentication error:', error);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Frontend Socket connection error:', error);
        this.isConnected = false;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('⚠️ Frontend Socket disconnected:', reason);
        this.isConnected = false;
      });

      // ============ TASK ASSIGNMENT EVENTS ============

      this.socket.on('task:assigned', (data) => {
        console.log('📢 Event Received: task:assigned', data);
        this.emit('task:assigned', data);
      });

      this.socket.on('task:driver-assigned', (data) => {
        console.log('📢 Event Received: task:driver-assigned', data);
        this.emit('task:driver-assigned', data);
      });

      // ============ SERVICE REQUEST ASSIGNMENT EVENTS ============

      this.socket.on('service-request:assigned', (data) => {
        console.log('📢 Event Received: service-request:assigned', data);
        this.emit('service-request:assigned', data);
      });

      this.socket.on('service-request:driver-assigned', (data) => {
        console.log('📢 Event Received: service-request:driver-assigned', data);
        this.emit('service-request:driver-assigned', data);
      });

      // ============ OTHER EVENTS ============

      this.socket.on('drivers:update', (data) => {
        console.log('📍 Event Received: drivers:update', data);
        this.emit('drivers:update', data);
      });

      this.socket.on('receiveMessage', (data) => {
        console.log('💬 Event Received: receiveMessage', data);
        this.emit('receiveMessage', data);
      });

      this.socket.on('new-alert', (data) => {
        console.log('🚨 Event Received: new-alert', data);
        this.emit('new-alert', data);
      });

      // ============ BIN MOCK SIMULATION EVENTS ============

      this.socket.on('bins:update', (data) => {
        console.log('🗑️ Event Received: bins:update', data);
        this.emit('bins:update', data);
      });

      this.socket.on('bin:alert', (data) => {
        console.log('🚨 Event Received: bin:alert', data);
        this.emit('bin:alert', data);
      });

      this.socket.on('bin:simulation:complete', (data) => {
        console.log('✅ Event Received: bin:simulation:complete', data);
        this.emit('bin:simulation:complete', data);
      });

    } catch (error) {
      console.error('❌ Failed to initialize socket:', error);
    }
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      this.eventHandlers.clear();
      console.log('🔴 Socket disconnected');
    }
  }

  /**
   * Check if socket is connected
   */
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  /**
   * Get socket ID
   */
  getSocketId() {
    return this.socket?.id || null;
  }

  /**
   * Register event handler (non-socket, local event system)
   */
  on(event, callback) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(callback);
  }

  /**
   * Unregister event handler
   */
  off(event, callback) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit local event
   */
  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Send event to server
   */
  emitToServer(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Socket not connected, cannot emit:', event);
    }
  }

  /**
   * Join a room
   */
  joinRoom(roomId, data) {
    this.emitToServer('joinRoom', { ...data, roomId });
  }

  /**
   * Send message to room
   */
  sendMessage(chatId, content) {
    this.emitToServer('message', { chatId, content });
  }

  /**
   * Join society
   */
  joinSociety(societyId) {
    this.emitToServer('join-society', { societyId });
  }

  /**
   * Leave society
   */
  leaveSociety() {
    this.emitToServer('leave-society', {});
  }

  /**
   * Get connection stats
   */
  getStats() {
    return {
      connected: this.isSocketConnected(),
      socketId: this.getSocketId(),
      url: SOCKET_URL,
      eventHandlers: this.eventHandlers.size
    };
  }
}

// Export singleton instance
export default new SocketService();
