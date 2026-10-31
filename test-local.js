const { chromium } = require('playwright');

async function test() {
  console.log('=== PLAYWRIGHT E2E TEST RESULTS ===\n');
  console.log('Target: http://localhost:3001');
  console.log('');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const PORT = 3001;
  const BASE_URL = `http://localhost:${PORT}`;
  const TIMEOUT = 45000;
  
  const results = {};
  
  // Test 1: Home page
  try {
    console.log('Testing home page (/es)...');
    await page.goto(`${BASE_URL}/es`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
    results.home = '✅ OK';
    console.log('  ✅ Home page loaded successfully');
  } catch (e) {
    results.home = `❌ ${e.message}`;
    console.log(`  ❌ Home page ERROR: ${e.message}`);
  }
  
  // Test 2: Login page
  try {
    console.log('\nTesting login page (/es/auth/login)...');
    await page.goto(`${BASE_URL}/es/auth/login`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
    const hasEmail = await page.locator('input[type="email"]').isVisible();
    const hasForm = await page.locator('form').count() > 0;
    if (hasEmail && hasForm) {
      results.login = '✅ OK (form detected)';
      console.log('  ✅ Login form OK - email input visible, form present');
    } else {
      results.login = `❌ INCOMPLETE (email=${hasEmail}, form=${hasForm})`;
      console.log(`  ❌ Login form incomplete: email=${hasEmail}, form=${hasForm}`);
    }
  } catch (e) {
    results.login = `❌ ${e.message}`;
    console.log(`  ❌ Login page ERROR: ${e.message}`);
  }
  
  // Test 3: Signup page (CRÍTICO)
  try {
    console.log('\nTesting signup page (/es/auth/signup)...');
    await page.goto(`${BASE_URL}/es/auth/signup`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
    const hasForm = await page.locator('form').count() > 0;
    const hasInput = await page.locator('input[type="text"]').count() > 0;
    if (hasForm && hasInput) {
      results.signup = '✅ OK (form detected)';
      console.log('  ✅ Signup form OK - form present with text inputs');
    } else {
      results.signup = `⚠️ PARTIAL (form=${hasForm}, input=${hasInput})`;
      console.log(`  ⚠️ Signup form incomplete: form=${hasForm}, input=${hasInput}`);
    }
  } catch (e) {
    results.signup = `❌ ${e.message}`;
    console.log(`  ❌ Signup page ERROR: ${e.message}`);
  }
  
  // Test 4: Register page
  try {
    console.log('\nTesting register page (/es/auth/register)...');
    await page.goto(`${BASE_URL}/es/auth/register`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT });
    const hasForm = await page.locator('form').count() > 0;
    results.register = '✅ OK';
    console.log('  ✅ Register page loaded successfully');
  } catch (e) {
    results.register = `❌ ${e.message}`;
    console.log(`  ❌ Register page ERROR: ${e.message}`);
  }
  
  await browser.close();
  
  console.log('\n=== SUMMARY ===');
  console.log(`Home:     ${results.home}`);
  console.log(`Login:    ${results.login}`);
  console.log(`Signup:   ${results.signup}`);
  console.log(`Register: ${results.register}`);
  console.log('\n✅ Playwright installed and functional');
  console.log('⏱️ Test completed');
}

test();
