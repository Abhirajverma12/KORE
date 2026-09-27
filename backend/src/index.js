const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const { createApp } = require('./app');
const { config } = require('./config');
const { setupChatSocketServer } = require('./sockets/chatGateway');

const app = createApp();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 20000,
  pingInterval: 10000,
});

setupChatSocketServer(io);

server.listen(config.port, () => {
  console.log(`=========================================`);
  console.log(`🚀 KORE JavaScript Server running on http://localhost:${config.port}`);
  console.log(`⚡ Socket.IO Gateway active for sub-200ms chat`);
  console.log(`🤖 AI Engine: ${config.openaiApiKey ? 'OpenAI GPT-4o-mini' : 'Heuristic NLP Model'}`);
  console.log(`💳 Razorpay Key ID: ${config.razorpayKeyId}`);
  console.log(`=========================================`);
});
