const OpenAI = require('openai');
const { config } = require('../config');

let openaiClient = null;

if (config.openaiApiKey && config.openaiApiKey.trim() !== '') {
  openaiClient = new OpenAI({
    apiKey: config.openaiApiKey,
  });
}

/**
 * Enhanced Fallback Heuristic Matcher in Pure JavaScript
 */
function heuristicIntentEnhancement(rawText) {
  const text = rawText.toLowerCase();

  const skillTaxonomy = {
    'Distributed Systems': ['distributed', 'consensus', 'raft', 'paxos', 'microservices', 'distributed systems', 'scalability', 'cap theorem'],
    'System Design': ['system design', 'high level design', 'hld', 'lld', 'architecture', 'load balancer', 'sharding', 'partitioning', 'horizontal scaling'],
    'Apache Kafka': ['kafka', 'message queue', 'event streaming', 'pubsub', 'pub/sub', 'event driven', 'rabbitmq', 'pulsar'],
    'Caching & Redis': ['redis', 'caching', 'memcached', 'cache invalidation', 'cache stampede', 'cdn'],
    'Machine Learning': ['machine learning', 'ml', 'deep learning', 'model', 'dataset', 'neural network', 'pytorch', 'tensorflow'],
    'Large Language Models (LLMs)': ['llm', 'gpt', 'openai', 'transformer', 'rag', 'vector database', 'embeddings', 'prompt engineering', 'generative ai', 'genai'],
    'RLHF': ['rlhf', 'alignment', 'dpo', 'preference tuning', 'reinforcement learning'],
    'Frontend Architecture': ['frontend', 'react', 'next.js', 'nextjs', 'typescript', 'css', 'state management', 'redux', 'tailwind', 'micro-frontends'],
    'Web Performance & CWV': ['core web vitals', 'cwv', 'lighthouse', 'ssr', 'streaming', 'bundle size', 'rendering performance', 'hydration'],
    'Engineering Management': ['engineering management', 'em', 'tech lead', 'leadership', 'team scaling', 'hiring', '1:1', 'roadmap', 'performance review', 'management'],
    'Startup Scaling': ['startup', 'seed to series a', 'series b', 'founding engineer', 'mvp', 'scale fast'],
    'Cloud Security': ['security', 'cloud security', 'devsecops', 'threat modeling', 'zero trust', 'iam', 'soc2', 'compliance', 'hardening', 'kubernetes', 'aws'],
  };

  const detectedSkills = new Set();

  for (const [skill, triggers] of Object.entries(skillTaxonomy)) {
    if (triggers.some((trigger) => text.includes(trigger))) {
      detectedSkills.add(skill);
    }
  }

  if (detectedSkills.size === 0) {
    if (text.includes('code') || text.includes('dev') || text.includes('software')) {
      detectedSkills.add('Software Engineering');
    } else if (text.includes('career') || text.includes('job') || text.includes('resume')) {
      detectedSkills.add('Career Growth');
    } else {
      detectedSkills.add('Technical Mentorship');
    }
  }

  let seniorityLevel = 'Senior';
  if (text.includes('staff') || text.includes('principal') || text.includes('distinguished') || text.includes('fellow')) {
    seniorityLevel = 'Staff';
  } else if (text.includes('vp') || text.includes('director') || text.includes('head of') || text.includes('executive') || text.includes('cto')) {
    seniorityLevel = 'Executive';
  } else if (text.includes('junior') || text.includes('entry') || text.includes('fresher') || text.includes('intern') || text.includes('beginner')) {
    seniorityLevel = 'Junior';
  } else if (text.includes('mid') || text.includes('intermediate') || text.includes('sde 2') || text.includes('sde2')) {
    seniorityLevel = 'Mid';
  }

  let problemType = 'General Advisory';
  if (text.includes('interview') || text.includes('prep') || text.includes('mock') || text.includes('faang') || text.includes('coding round')) {
    problemType = 'Interview Preparation';
  } else if (text.includes('review') || text.includes('audit') || text.includes('feedback') || text.includes('critique')) {
    problemType = 'Architecture Review';
  } else if (text.includes('bug') || text.includes('issue') || text.includes('troubleshoot') || text.includes('debug') || text.includes('crash')) {
    problemType = 'Debugging & Troubleshooting';
  } else if (text.includes('career') || text.includes('promotion') || text.includes('salary') || text.includes('transition') || text.includes('switch')) {
    problemType = 'Career Guidance';
  }

  let urgency = 'medium';
  if (text.includes('urgent') || text.includes('asap') || text.includes('tomorrow') || text.includes('this week') || text.includes('immediately')) {
    urgency = 'high';
  } else if (text.includes('whenever') || text.includes('exploring') || text.includes('curious') || text.includes('future')) {
    urgency = 'low';
  }

  const primarySkillsList = Array.from(detectedSkills);

  return {
    primarySkills: primarySkillsList.slice(0, 4),
    secondarySkills: primarySkillsList.slice(4),
    seniorityLevel,
    problemType,
    industryContext: text.includes('faang') || text.includes('big tech') ? ['Big Tech / Tier 1'] : ['Tech / SaaS'],
    urgency,
    summaryIntent: `Goal: ${problemType} focused on ${primarySkillsList.slice(0, 3).join(', ')} at a ${seniorityLevel} engineering caliber.`,
    expectedOutcomes: [
      `Master key architecture trade-offs for ${primarySkillsList[0] || 'the target domain'}`,
      'Actionable critique on real-world system patterns and pitfalls',
      'Personalized roadmap with recommended practice exercises',
    ],
  };
}

async function enhanceQueryIntent(rawText) {
  if (!openaiClient) {
    return heuristicIntentEnhancement(rawText);
  }

  try {
    const prompt = `You are the AI Query Intent Engine for KORE, a top-tier technical mentorship platform.
Your task is to analyze the mentee's unstructured problem description and output a structured JSON schema.

Mentee Query: "${rawText}"

Extract and infer:
1. "primarySkills": string[]
2. "secondarySkills": string[]
3. "seniorityLevel": string - "Junior" | "Mid" | "Senior" | "Staff" | "Principal" | "Executive" | "Any"
4. "problemType": string - "Interview Preparation" | "Architecture Review" | "Code Review" | "Career Guidance" | "Debugging" | "General"
5. "industryContext": string[]
6. "urgency": "low" | "medium" | "high"
7. "summaryIntent": string
8. "expectedOutcomes": string[]

Respond strictly in valid JSON format.`;

    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You extract precise technical mentorship intent and return pure JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return heuristicIntentEnhancement(rawText);
    }

    const parsed = JSON.parse(content);
    return {
      primarySkills: parsed.primarySkills || ['Software Engineering'],
      secondarySkills: parsed.secondarySkills || [],
      seniorityLevel: parsed.seniorityLevel || 'Senior',
      problemType: parsed.problemType || 'General Mentorship',
      industryContext: parsed.industryContext || [],
      urgency: parsed.urgency || 'medium',
      summaryIntent: parsed.summaryIntent || rawText,
      expectedOutcomes: parsed.expectedOutcomes || ['Clarify system trade-offs', 'Actionable roadmap'],
    };
  } catch (error) {
    console.warn('OpenAI query enhancement fallback:', error.message);
    return heuristicIntentEnhancement(rawText);
  }
}

module.exports = {
  enhanceQueryIntent,
  heuristicIntentEnhancement,
};
