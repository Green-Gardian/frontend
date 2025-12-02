# WebSocket Setup Guide

## Current Status
The alerts page is working normally, but real-time features are disabled.

## To Enable Real-time Features

### 1. Install Socket.io Client
```bash
cd frontend
npm install socket.io-client
```

### 2. Update the WebSocket Hook
Replace the mock implementation in `src/hooks/useWebSocket.js` with proper Socket.io client code.

## Current Functionality
- ✅ Alert creation, editing, deletion
- ✅ Search and filtering
- ✅ Statistics and pagination
- ✅ All CRUD operations

Only real-time notifications are disabled until Socket.io client is installed.
