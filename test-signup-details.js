const { chromium } = require('playwright');

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to signup page...');
    await page.goto('http://localhost:3001/es/auth/signup', { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    console.log('\nAnalyzing signup page structure:');
    
    // Get page content
    const title = await page.title();
    console.log(`  Page title: ${title}`);
    
    // Check for various form elements
    const forms = await page.locator('form').count();
    const inputs = await page.locator('input').count();
    const buttons = await page.locator('button').count();
    const textInputs = await page.locator('input[type="text"]').count();
    const emailInputs = await page.locator('input[type="email"]').count();
    const passwordInputs = await page.locator('input[type="password"]').count();
    
    console.log(`  Forms found: ${forms}`);
    console.log(`  Total inputs: ${inputs}`);
    console.log(`  Text inputs: ${textInputs}`);
    console.log(`  Email inputs: ${emailInputs}`);
    console.log(`  Password inputs: ${passwordInputs}`);
    console.log(`  Buttons: ${buttons}`);
    
    // Get page HTML (first 1000 chars)
    const html = await page.content();
    console.log(`\n  Page size: ${html.length} chars`);
    
    // Check for specific elements
    const hasSignupButton = await page.locator('button:has-text("Sign up")').count() > 0;
    const hasRegisterButton = await page.locator('button:has-text("Register")').count() > 0;
    console.log(`\n  Has 'Sign up' button: ${hasSignupButton}`);
    console.log(`  Has 'Register' button: ${hasRegisterButton}`);
    
    // Get visible text
    const bodyText = await page.locator('body').textContent();
    const isSignupPageVisible = bodyText.includes('sign') || bodyText.includes('signup') || bodyText.includes('registro');
    console.log(`  Contains signup-related text: ${isSignupPageVisible}`);
    
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
  
  await browser.close();
}

test();
