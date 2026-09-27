const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SENIORITY_WEIGHTS = {
  junior: 1,
  mid: 2,
  senior: 3,
  staff: 4,
  principal: 5,
  executive: 6,
};

function normalizeString(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function calculateSkillScore(requestedSkills, mentorSkills) {
  if (!requestedSkills || !requestedSkills.length) return 75;

  let matchedCount = 0;
  const normMentorSkills = mentorSkills.map(normalizeString);

  for (const reqSkill of requestedSkills) {
    const normReq = normalizeString(reqSkill);
    const hasMatch = normMentorSkills.some(
      (mSkill) => mSkill.includes(normReq) || normReq.includes(mSkill)
    );
    if (hasMatch) {
      matchedCount++;
    }
  }

  const ratio = matchedCount / requestedSkills.length;
  return Math.min(100, Math.round(ratio * 90 + (matchedCount > 0 ? 10 : 0)));
}

function calculateSeniorityScore(requestedLevel, mentorSeniority) {
  const reqNorm = (requestedLevel || '').toLowerCase();
  const mentorNorm = (mentorSeniority || '').toLowerCase();

  let reqWeight = 3;
  for (const [key, val] of Object.entries(SENIORITY_WEIGHTS)) {
    if (reqNorm.includes(key)) reqWeight = val;
  }

  let mentorWeight = 3;
  for (const [key, val] of Object.entries(SENIORITY_WEIGHTS)) {
    if (mentorNorm.includes(key)) mentorWeight = val;
  }

  if (mentorWeight >= reqWeight) {
    return 100;
  } else if (mentorWeight === reqWeight - 1) {
    return 80;
  } else {
    return 60;
  }
}

function calculateRatingScore(ratingAvg, totalReviews) {
  const baseRatingNorm = ((ratingAvg || 5.0) / 5.0) * 85;
  const volumeBonus = Math.min(15, (totalReviews || 0) * 0.5);
  return Math.min(100, Math.round(baseRatingNorm + volumeBonus));
}

function calculateAvailabilityScore(availability) {
  if (!availability || availability.length === 0) return 50;
  return Math.min(100, 70 + availability.length * 15);
}

async function rankMentorsForQuery(intent) {
  const mentors = await prisma.mentorProfile.findMany({
    where: { active: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  const rankedList = [];

  for (const mentor of mentors) {
    const parsedSkills = Array.isArray(mentor.skills)
      ? mentor.skills
      : JSON.parse(mentor.skills || '[]');

    const parsedAvailability = Array.isArray(mentor.availability)
      ? mentor.availability
      : JSON.parse(mentor.availability || '[]');

    const allRequestedSkills = [
      ...(intent.primarySkills || []),
      ...(intent.secondarySkills || []),
    ];

    const skillFit = calculateSkillScore(allRequestedSkills, parsedSkills);
    const seniorityFit = calculateSeniorityScore(intent.seniorityLevel, mentor.seniority);
    const ratingFit = calculateRatingScore(mentor.ratingAvg, mentor.totalReviews);
    const availabilityFit = calculateAvailabilityScore(parsedAvailability);

    const compositeScore = Math.round(
      skillFit * 0.45 +
      seniorityFit * 0.25 +
      ratingFit * 0.20 +
      availabilityFit * 0.10
    );

    const reasons = [];
    const matchedSkills = parsedSkills.filter((ms) =>
      allRequestedSkills.some((rs) =>
        normalizeString(ms).includes(normalizeString(rs)) ||
        normalizeString(rs).includes(normalizeString(ms))
      )
    );

    if (matchedSkills.length > 0) {
      reasons.push(`Direct expertise in: ${matchedSkills.slice(0, 3).join(', ')}`);
    }
    if (mentor.company) {
      reasons.push(`${mentor.seniority} background at ${mentor.company}`);
    }
    if (mentor.ratingAvg >= 4.8) {
      reasons.push(`Top-rated mentor (${mentor.ratingAvg.toFixed(2)}★) with ${mentor.totalSessions} completed sessions`);
    }

    const breakdown = {
      overallScore: compositeScore,
      skillFit,
      seniorityFit,
      ratingFit,
      availabilityFit,
      reasons,
    };

    rankedList.push({
      mentorId: mentor.id,
      userId: mentor.user.id,
      name: mentor.user.name,
      email: mentor.user.email,
      avatarUrl: mentor.user.avatarUrl,
      headline: mentor.headline,
      company: mentor.company,
      seniority: mentor.seniority,
      bio: mentor.bio,
      skills: parsedSkills,
      hourlyRate: mentor.hourlyRate,
      currency: mentor.currency,
      ratingAvg: mentor.ratingAvg,
      totalReviews: mentor.totalReviews,
      totalSessions: mentor.totalSessions,
      availability: parsedAvailability,
      matchScore: compositeScore,
      matchBreakdown: breakdown,
    });
  }

  rankedList.sort((a, b) => b.matchScore - a.matchScore);
  return rankedList;
}

module.exports = {
  rankMentorsForQuery,
  calculateSkillScore,
  calculateSeniorityScore,
  calculateRatingScore,
};
