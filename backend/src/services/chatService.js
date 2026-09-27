const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function isUserAuthorizedForSession(userId, sessionId, role) {
  if (role === 'admin') return true;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { mentorId: true, menteeId: true, status: true },
  });

  if (!session) return false;
  return session.mentorId === userId || session.menteeId === userId;
}

async function isSessionPaid(sessionId) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { status: true },
  });
  return session?.status === 'PAID';
}

async function getSessionMessages(sessionId) {
  return await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          role: true,
          avatarUrl: true,
        },
      },
    },
  });
}

async function saveMessage(params) {
  const { sessionId, senderId, text } = params;

  return await prisma.message.create({
    data: {
      sessionId,
      senderId,
      text,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          role: true,
          avatarUrl: true,
        },
      },
    },
  });
}

module.exports = {
  isUserAuthorizedForSession,
  isSessionPaid,
  getSessionMessages,
  saveMessage,
};
