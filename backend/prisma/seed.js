const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding KORE database (Pure JavaScript)...');

  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.session.deleteMany();
  await prisma.match.deleteMany();
  await prisma.query.deleteMany();
  await prisma.mentorProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  await prisma.user.create({
    data: {
      name: 'KORE Admin',
      email: 'admin@kore.ai',
      passwordHash,
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    },
  });

  // 2. Create Mentees
  const mentee1 = await prisma.user.create({
    data: {
      name: 'Alex Chen',
      email: 'alex@example.com',
      passwordHash,
      role: 'mentee',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      passwordHash,
      role: 'mentee',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    },
  });

  // 3. Create Mentors
  const mentorsData = [
    {
      name: 'Dr. Sarah Lin',
      email: 'sarah.lin@kore.ai',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      headline: 'Principal AI Researcher & Ex-Google DeepMind Lead',
      company: 'Google DeepMind',
      seniority: 'Principal / Research Director',
      bio: 'Over 12 years in generative modeling, LLM alignment, RLHF, and deploying multimodal architectures to hundreds of millions of users.',
      skills: JSON.stringify([
        'Machine Learning',
        'Large Language Models (LLMs)',
        'RLHF',
        'PyTorch',
        'Model Evaluation',
        'AI Architecture',
        'Vector Search & RAG'
      ]),
      hourlyRate: 3500,
      currency: 'INR',
      ratingAvg: 4.96,
      totalReviews: 48,
      totalSessions: 62,
      availability: JSON.stringify(['Mon & Wed 7-10 PM IST', 'Sat 10 AM - 2 PM IST']),
    },
    {
      name: 'Vikram Malhotra',
      email: 'vikram.m@kore.ai',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      headline: 'Staff Distributed Systems Engineer @ Uber (Ex-Stripe)',
      company: 'Uber',
      seniority: 'Staff Engineer',
      bio: 'Specialist in hyper-scale message queues (Kafka, Flink), high throughput real-time telemetry, zero-downtime database migrations, and Staff+ interview prep.',
      skills: JSON.stringify([
        'Distributed Systems',
        'System Design',
        'Apache Kafka',
        'Caching & Redis',
        'Golang',
        'Microservices',
        'High Throughput Architecture',
        'Staff Interview Prep'
      ]),
      hourlyRate: 3000,
      currency: 'INR',
      ratingAvg: 4.98,
      totalReviews: 64,
      totalSessions: 89,
      availability: JSON.stringify(['Tue & Thu 6-9 PM IST', 'Sun 11 AM - 4 PM IST']),
    },
    {
      name: 'Elena Rostova',
      email: 'elena.r@kore.ai',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      headline: 'Staff Frontend Architect & Core Web Vitals Specialist',
      company: 'Airbnb',
      seniority: 'Staff Engineer',
      bio: 'Building enterprise React/Next.js design systems, streaming SSR, performance budgets, micro-frontends, and accessible design system tooling.',
      skills: JSON.stringify([
        'Frontend Architecture',
        'React',
        'Next.js (App Router)',
        'TypeScript',
        'Web Performance & CWV',
        'Design Systems',
        'State Management'
      ]),
      hourlyRate: 2500,
      currency: 'INR',
      ratingAvg: 4.92,
      totalReviews: 35,
      totalSessions: 52,
      availability: JSON.stringify(['Weekdays 8-10 PM IST', 'Sat 2 PM - 6 PM IST']),
    },
    {
      name: 'David Kalu',
      email: 'david.kalu@kore.ai',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
      headline: 'VP of Engineering & Seed-to-Series B Startup Scaling',
      company: 'Finscale',
      seniority: 'VP of Engineering',
      bio: 'Scaled engineering teams from 4 to 90 engineers. Expert in engineering management, team topology, roadmap prioritization, and hiring senior leaders.',
      skills: JSON.stringify([
        'Engineering Management',
        'Leadership & Hiring',
        'Startup Scaling',
        'Technical Strategy',
        'Career Growth & Promo',
        'Fintech Architecture'
      ]),
      hourlyRate: 4000,
      currency: 'INR',
      ratingAvg: 4.95,
      totalReviews: 29,
      totalSessions: 41,
      availability: JSON.stringify(['Mon & Fri 6-8 PM IST', 'Sat 9 AM - 1 PM IST']),
    },
    {
      name: 'Aisha Siddiqui',
      email: 'aisha.s@kore.ai',
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=250',
      headline: 'Principal Cloud Security & DevSecOps Architect @ AWS',
      company: 'Amazon Web Services',
      seniority: 'Principal Architect',
      bio: 'Cloud governance, Zero Trust architecture, Kubernetes hardening, SOC2/ISO compliance, and scalable threat modeling.',
      skills: JSON.stringify([
        'Cloud Security',
        'AWS',
        'Kubernetes / K8s',
        'DevSecOps',
        'Zero Trust',
        'Terraform / IaC',
        'Compliance & SOC2'
      ]),
      hourlyRate: 3200,
      currency: 'INR',
      ratingAvg: 4.88,
      totalReviews: 22,
      totalSessions: 30,
      availability: JSON.stringify(['Wed & Thu 7-9 PM IST', 'Sun 2 PM - 5 PM IST']),
    },
  ];

  for (const m of mentorsData) {
    await prisma.user.create({
      data: {
        name: m.name,
        email: m.email,
        passwordHash,
        role: 'mentor',
        avatarUrl: m.avatarUrl,
        mentorProfile: {
          create: {
            headline: m.headline,
            company: m.company,
            bio: m.bio,
            skills: m.skills,
            seniority: m.seniority,
            hourlyRate: m.hourlyRate,
            currency: m.currency,
            ratingAvg: m.ratingAvg,
            totalReviews: m.totalReviews,
            totalSessions: m.totalSessions,
            availability: m.availability,
            active: true,
          },
        },
      },
    });
  }

  // Create demo session for Alex Chen with Vikram Malhotra
  const vikramUser = await prisma.user.findUnique({
    where: { email: 'vikram.m@kore.ai' },
    include: { mentorProfile: true },
  });

  if (vikramUser && vikramUser.mentorProfile) {
    const query = await prisma.query.create({
      data: {
        menteeId: mentee1.id,
        rawText: 'I need help preparing for a Staff System Design interview on Distributed Caching & Kafka partitions at high scale.',
        enhancedIntent: JSON.stringify({
          primarySkills: ['Distributed Systems', 'System Design', 'Apache Kafka', 'Caching & Redis'],
          seniorityLevel: 'Staff',
          problemType: 'Interview Preparation',
          industryContext: ['Big Tech', 'Ride-sharing', 'Fintech'],
          urgency: 'high',
          summaryIntent: 'Staff-level system design interview coaching focused on high-throughput Kafka partitioning and caching resilience.',
        }),
      },
    });

    await prisma.match.create({
      data: {
        queryId: query.id,
        mentorId: vikramUser.mentorProfile.id,
        matchScore: 97.5,
        matchBreakdown: JSON.stringify({
          skillFit: 98,
          seniorityFit: 100,
          ratingFit: 99,
          availabilityFit: 92,
          reasons: [
            'Direct expertise in Kafka and Distributed Systems at Uber & Stripe',
            'Staff Engineer seniority aligns perfectly with requested interview tier',
            'Exceptional rating (4.98/5.0) across 89 completed mentorship sessions',
          ],
        }),
      },
    });

    const session = await prisma.session.create({
      data: {
        queryId: query.id,
        mentorId: vikramUser.id,
        menteeId: mentee1.id,
        status: 'PAID',
        topic: 'Staff System Design: Kafka Partitioning & Caching Resilience',
        amount: 3000,
        currency: 'INR',
        razorpayOrderId: 'order_seed_demo_101',
        razorpayPaymentId: 'pay_seed_demo_202',
        razorpaySignature: 'sig_seed_demo_303',
      },
    });

    await prisma.message.createMany({
      data: [
        {
          sessionId: session.id,
          senderId: mentee1.id,
          text: 'Hi Vikram! Looking forward to discussing Kafka partition rebalancing and cache stampede strategies today.',
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          sessionId: session.id,
          senderId: vikramUser.id,
          text: 'Hey Alex! Glad to connect. Bring your current architecture diagrams or specific edge-cases, and we can dissect real production failure modes.',
          createdAt: new Date(Date.now() - 1800000),
        },
      ],
    });
  }

  console.log('✅ JavaScript Database Seeded Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
