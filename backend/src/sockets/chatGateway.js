const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { isUserAuthorizedForSession, isSessionPaid, saveMessage } = require('../services/chatService');

function setupChatSocketServer(io) {
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication error: Token missing in handshake'));
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 Socket connected: ${user.name} (${user.userId}) [${socket.id}]`);

    socket.on('join_session', async ({ sessionId }, callback) => {
      try {
        const authorized = await isUserAuthorizedForSession(user.userId, sessionId, user.role);
        if (!authorized) {
          if (callback) callback({ success: false, error: 'Unauthorized to join this mentorship session' });
          socket.emit('error', { message: 'Unauthorized session access' });
          return;
        }

        const paid = await isSessionPaid(sessionId);
        if (!paid && user.role !== 'admin') {
          if (callback) callback({ success: false, error: 'Payment required to unlock live chat room' });
          socket.emit('session_locked', { sessionId, message: 'Please complete payment to access chat.' });
          return;
        }

        const roomName = `session:${sessionId}`;
        socket.join(roomName);

        socket.to(roomName).emit('user_joined', {
          userId: user.userId,
          name: user.name,
          role: user.role,
        });

        if (callback) callback({ success: true, room: roomName });
      } catch (error) {
        console.error('Error joining session room:', error);
        if (callback) callback({ success: false, error: 'Server error joining session' });
      }
    });

    socket.on('send_message', async (data, callback) => {
      const startTime = Date.now();
      try {
        const { sessionId, text, clientSentAt } = data;

        if (!text || text.trim() === '') {
          if (callback) callback({ success: false, error: 'Message cannot be empty' });
          return;
        }

        const roomName = `session:${sessionId}`;

        const authorized = await isUserAuthorizedForSession(user.userId, sessionId, user.role);
        const paid = await isSessionPaid(sessionId);

        if (!authorized || (!paid && user.role !== 'admin')) {
          if (callback) callback({ success: false, error: 'Session is not active or payment pending' });
          return;
        }

        const savedMessage = await saveMessage({
          sessionId,
          senderId: user.userId,
          text: text.trim(),
        });

        const serverLatencyMs = Date.now() - startTime;
        const totalRoundtripEst = clientSentAt ? Date.now() - clientSentAt : serverLatencyMs;

        io.to(roomName).emit('new_message', {
          ...savedMessage,
          latencyMs: serverLatencyMs,
        });

        if (callback) {
          callback({
            success: true,
            message: savedMessage,
            latencyMs: serverLatencyMs,
            totalRoundtripEst,
          });
        }
      } catch (error) {
        console.error('Error handling send_message:', error);
        if (callback) callback({ success: false, error: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ sessionId, isTyping }) => {
      const roomName = `session:${sessionId}`;
      socket.to(roomName).emit('user_typing', {
        userId: user.userId,
        name: user.name,
        isTyping,
      });
    });

    socket.on('leave_session', ({ sessionId }) => {
      const roomName = `session:${sessionId}`;
      socket.leave(roomName);
      socket.to(roomName).emit('user_left', {
        userId: user.userId,
        name: user.name,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${user.name} (${user.userId})`);
    });
  });
}

module.exports = { setupChatSocketServer };
