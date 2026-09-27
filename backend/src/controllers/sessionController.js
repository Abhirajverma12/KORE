const { PrismaClient } = require('@prisma/client');
const { getSessionMessages, isUserAuthorizedForSession } = require('../services/chatService');

const prisma = new PrismaClient();

async function createSession(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { mentorUserId, queryId, topic, scheduledAt } = req.body;

    if (!mentorUserId) {
      return res.status(400).json({ error: 'Mentor user ID is required' });
    }

    const mentorUser = await prisma.user.findUnique({
      where: { id: mentorUserId },
      include: { mentorProfile: true },
    });

    if (!mentorUser || !mentorUser.mentorProfile) {
      return res.status(404).json({ error: 'Mentor not found or invalid mentor profile' });
    }

    const session = await prisma.session.create({
      data: {
        menteeId: req.user.userId,
        mentorId: mentorUser.id,
        queryId: queryId || null,
        topic: topic || `Mentorship with ${mentorUser.name}`,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        amount: mentorUser.mentorProfile.hourlyRate,
        currency: mentorUser.mentorProfile.currency || 'INR',
        status: 'PENDING',
      },
      include: {
        mentor: {
          select: { id: true, name: true, email: true, avatarUrl: true, mentorProfile: true },
        },
        mentee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    res.status(201).json({ session });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create mentorship session' });
  }
}

async function getSession(req, res) {
  try {
    const { id } = req.params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        mentor: {
          select: { id: true, name: true, email: true, avatarUrl: true, mentorProfile: true },
        },
        mentee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        query: true,
        review: true,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (
      req.user &&
      req.user.role !== 'admin' &&
      session.mentorId !== req.user.userId &&
      session.menteeId !== req.user.userId
    ) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this session' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
}

async function getSessionChatMessages(req, res) {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const authorized = await isUserAuthorizedForSession(req.user.userId, id, req.user.role);
    if (!authorized) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to view messages in this session' });
    }

    const messages = await getSessionMessages(id);
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}

async function getUserSessions(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isMentor = req.user.role === 'mentor';
    const whereClause = isMentor
      ? { mentorId: req.user.userId }
      : { menteeId: req.user.userId };

    const sessions = await prisma.session.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        mentor: {
          select: { id: true, name: true, email: true, avatarUrl: true, mentorProfile: true },
        },
        mentee: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ error: 'Failed to fetch user sessions' });
  }
}

async function completeSession(req, res) {
  try {
    const { id } = req.params;

    const session = await prisma.session.findUnique({ where: { id } });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (
      req.user &&
      req.user.role !== 'admin' &&
      session.mentorId !== req.user.userId &&
      session.menteeId !== req.user.userId
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.session.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    res.json({ session: updated });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(500).json({ error: 'Failed to complete session' });
  }
}

module.exports = {
  createSession,
  getSession,
  getSessionChatMessages,
  getUserSessions,
  completeSession,
};
