const { runAiAndMatchingTests } = require('./aiAndMatching.test');
const { runPaymentAndCryptoTests } = require('./paymentAndCrypto.test');
const { runRbacAndAuthTests } = require('./rbacAndAuth.test');

async function run() {
  console.log('====================================================');
  console.log('  🚀 KORE BACKEND AUTOMATED TEST SUITE (PURE JS)    ');
  console.log('====================================================');

  const start = Date.now();
  try {
    await runAiAndMatchingTests();
    await runPaymentAndCryptoTests();
    await runRbacAndAuthTests();

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log('====================================================');
    console.log(`  🎉 ALL JS TESTS COMPLETED SUCCESSFULLY IN ${duration}s!  `);
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

run();
