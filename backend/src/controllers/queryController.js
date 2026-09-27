const { PrismaClient } = require('@prisma/client');
const { enhanceQueryIntent } = require('../services/aiService');
const { rankMentorsForQuery } = require('../services/matchingService');

const prisma = new PrismaClient();

async function enhanceAndMatch(req, res) {
  try {
    const { rawText } = req.body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide a descriptive query of at least 5 characters.' });
    }

    const intent = await enhanceQueryIntent(rawText.trim());
    const matches = await rankMentorsForQuery(intent);

    let queryRecord = null;

    if (req.user && req.user.userId) {
      queryRecord = await prisma.query.create({
        data: {
          menteeId: req.user.userId,
          rawText: rawText.trim(),
          enhancedIntent: JSON.stringify(intent),
        },
      });

      const topMatches = matches.slice(0, 5);
      for (const m of topMatches) {
        await prisma.match.create({
          data: {
            queryId: queryRecord.id,
            mentorId: m.mentorId,
            matchScore: m.matchScore,
            matchBreakdown: JSON.stringify(m.matchBreakdown),
            status: 'suggested',
          },
        });
      }
    }

    res.json({
      queryId: queryRecord ? queryRecord.id : null,
      rawText: rawText.trim(),
      intent,
      matches,
      totalMatches: matches.length,
    });
  } catch (error) {
    console.error('Error enhancing query and matching mentors:', error);
    res.status(500).json({ error: 'Failed to process mentorship matching query' });
  }
}

async function getQueryHistory(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const queries = await prisma.query.findMany({
      where: { menteeId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        matches: {
          include: {
            mentor: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatarUrl: true },
                },
              },
            },
          },
        },
      },
    });

    const parsedQueries = queries.map((q) => ({
      ...q,
      enhancedIntent: JSON.parse(q.enhancedIntent || '{}'),
      matches: q.matches.map((m) => ({
        ...m,
        matchBreakdown: JSON.parse(m.matchBreakdown || '{}'),
      })),
    }));

    res.json({ queries: parsedQueries });
  } catch (error) {
    console.error('Error fetching query history:', error);
    res.status(500).json({ error: 'Failed to fetch query history' });
  }
}

async function getQueryById(req, res) {
  try {
    const { id } = req.params;

    const query = await prisma.query.findUnique({
      where: { id },
      include: {
        matches: {
          include: {
            mentor: {
              include: {
                user: { select: { id: true, name: true, email: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    if (!query) {
      return res.status(404).json({ error: 'Query not found' });
    }

    if (req.user && req.user.role !== 'admin' && query.menteeId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this query' });
    }

    res.json({
      query: {
        ...query,
        enhancedIntent: JSON.parse(query.enhancedIntent || '{}'),
        matches: query.matches.map((m) => ({
          ...m,
          matchBreakdown: JSON.parse(m.matchBreakdown || '{}'),
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching query details:', error);
    res.status(500).json({ error: 'Failed to fetch query details' });
  }
}

module.exports = {
  enhanceAndMatch,
  getQueryHistory,
  getQueryById,
};
