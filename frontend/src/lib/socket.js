import { io } from 'socket.io-client';
import { getAuthToken } from './api';

let socket = null;

export function getSocket() {
  const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
  const token = getAuthToken();

  if (!socket || !socket.connected) {
    socket = io(SERVER_URL, {
      auth: { token: token || '' },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
