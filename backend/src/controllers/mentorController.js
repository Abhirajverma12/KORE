const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getMentors(req, res) {
  try {
    const { skill, query } = req.query;

    const mentors = await prisma.mentorProfile.findMany({
      where: { active: true },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { ratingAvg: 'desc' },
    });

    let formatted = mentors.map((m) => ({
      ...m,
      skills: JSON.parse(m.skills || '[]'),
      availability: JSON.parse(m.availability || '[]'),
    }));

    if (skill && typeof skill === 'string') {
      const skillLower = skill.toLowerCase();
      formatted = formatted.filter((m) =>
        m.skills.some((s) => s.toLowerCase().includes(skillLower))
      );
    }

    if (query && typeof query === 'string') {
      const qLower = query.toLowerCase();
      formatted = formatted.filter(
        (m) =>
          m.user.name.toLowerCase().includes(qLower) ||
          m.headline.toLowerCase().includes(qLower) ||
          m.company.toLowerCase().includes(qLower)
      );
    }

    res.json({ mentors: formatted });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
}

async function getMentorProfile(req, res) {
  try {
    const { id } = req.params;

    const mentor = await prisma.mentorProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor profile not found' });
    }

    res.json({
      mentor: {
        ...mentor,
        skills: JSON.parse(mentor.skills || '[]'),
        availability: JSON.parse(mentor.availability || '[]'),
      },
    });
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    res.status(500).json({ error: 'Failed to fetch mentor profile' });
  }
}

async function updateMentorProfile(req, res) {
  try {
    if (!req.user || req.user.role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can update mentor profile' });
    }

    const { headline, company, bio, skills, hourlyRate, availability, active, seniority } = req.body;

    const updated = await prisma.mentorProfile.update({
      where: { userId: req.user.userId },
      data: {
        ...(headline && { headline }),
        ...(company && { company }),
        ...(bio && { bio }),
        ...(seniority && { seniority }),
        ...(typeof hourlyRate === 'number' && { hourlyRate }),
        ...(skills && { skills: JSON.stringify(skills) }),
        ...(availability && { availability: JSON.stringify(availability) }),
        ...(typeof active === 'boolean' && { active }),
      },
    });

    res.json({
      mentor: {
        ...updated,
        skills: JSON.parse(updated.skills || '[]'),
        availability: JSON.parse(updated.availability || '[]'),
      },
    });
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    res.status(500).json({ error: 'Failed to update mentor profile' });
  }
}

module.exports = {
  getMentors,
  getMentorProfile,
  updateMentorProfile,
};
