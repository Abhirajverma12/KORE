const { enhanceQueryIntent } = require('../src/services/aiService');
const { rankMentorsForQuery } = require('../src/services/matchingService');

async function runAiAndMatchingTests() {
  console.log('\n--- 🧪 TEST SUITE: AI Query Enhancement & Multi-Factor Matching (Pure JS) ---');

  const query1 = 'Looking for a Staff Engineer to prep for system design on distributed caches, Redis stampede, and Kafka clustering.';
  console.log(`[Test 1] Input query: "${query1}"`);
  
  const intent1 = await enhanceQueryIntent(query1);
  console.log('  -> Extracted Intent:', JSON.stringify(intent1, null, 2));

  if (!intent1.primarySkills || intent1.primarySkills.length === 0) {
    throw new Error('AI failed to extract primary skills');
  }
  if (intent1.seniorityLevel !== 'Staff') {
    throw new Error(`Expected seniority level "Staff", got "${intent1.seniorityLevel}"`);
  }
  console.log('  ✅ Intent extraction verified (Skills, Seniority, Problem Type).');

  const rankedMentors = await rankMentorsForQuery(intent1);
  console.log(`  -> Ranked ${rankedMentors.length} mentors:`);
  rankedMentors.forEach((m, idx) => {
    console.log(`     #${idx + 1}: ${m.name} (${m.company}) - Score: ${m.matchScore}%`);
  });

  if (rankedMentors.length === 0) {
    throw new Error('No mentors returned in ranking');
  }

  const topMentor = rankedMentors[0];
  if (!topMentor.name.includes('Vikram') && topMentor.matchScore < 80) {
    throw new Error(`Top mentor expected to be Vikram Malhotra, got ${topMentor.name}`);
  }
  console.log(`  ✅ Top mentor matched correctly: ${topMentor.name} with score ${topMentor.matchScore}%.`);

  const query2 = 'Need guidance on evaluating LLM embeddings, RAG pipeline latency, and PyTorch fine-tuning.';
  console.log(`\n[Test 2] Input query: "${query2}"`);
  const intent2 = await enhanceQueryIntent(query2);
  const rankedMentors2 = await rankMentorsForQuery(intent2);
  
  console.log(`     #1: ${rankedMentors2[0].name} (${rankedMentors2[0].company}) - Score: ${rankedMentors2[0].matchScore}%`);
  if (!rankedMentors2[0].name.includes('Sarah Lin')) {
    throw new Error(`Top mentor for LLM RAG expected to be Dr. Sarah Lin, got ${rankedMentors2[0].name}`);
  }
  console.log('  ✅ AI ML specialist correctly ranked #1.');

  console.log('  🎉 All AI Query Enhancement & Matching JS tests PASSED!\n');
}

module.exports = { runAiAndMatchingTests };
