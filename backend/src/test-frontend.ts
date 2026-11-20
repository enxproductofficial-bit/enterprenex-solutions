import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'enterprenex_enterprise_jwt_secret_2026_super_secure';

interface PageTestResult {
  route: string;
  title: string;
  passed: boolean;
  consoleErrors: string[];
  assertions: string[];
}

async function verifyFrontend() {
  console.log('===============================================================');
  console.log('🌐 ENTERPRENEX EWMS FRONTEND AUTOMATED E2E VERIFICATION');
  console.log('===============================================================\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Perform Real Executive Login via /login form
  console.log('--- 1. Authenticating via Portal Login Form ---');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

  await page.waitForSelector('input[type="text"]');
  await page.type('input[type="text"]', 'director@enterprenex.solutions');
  await page.type('input[type="password"]', 'Enterprenex@Director2026');
  await page.click('button[type="submit"]');

  // Wait for redirect to /admin
  await page.waitForFunction(() => (globalThis as any).location.pathname.startsWith('/admin'), { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1500));
  console.log('✅ Executive Login Successful. Redirected to /admin\n');

  const routes = [
    { path: '/admin', expectedText: 'Executive Operations', name: 'Executive Dashboard' },
    { path: '/admin/team', expectedText: 'Personnel', name: 'Workforce & Team Ledger' },
    { path: '/admin/tasks', expectedText: 'Sprint', name: 'Tasks & Agile Kanban' },
    { path: '/admin/projects', expectedText: 'Project', name: 'Project Portfolio' },
    { path: '/admin/finance', expectedText: 'Finance', name: 'Finance & P&L Hub' },
  ];

  const results: PageTestResult[] = [];

  for (const r of routes) {
    const consoleErrors: string[] = [];
    const pageUrl = `http://localhost:5173${r.path}`;

    const onConsole = (msg: any) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore favicon or non-critical 404 noise if any
        if (!text.includes('favicon')) {
          consoleErrors.push(text);
        }
      }
    };

    page.on('console', onConsole);

    try {
      await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 15000 });
      await page.waitForFunction(
        () => !(globalThis as any).document.body.innerText.includes('Authenticating Session & Workspace...'),
        { timeout: 10000 }
      ).catch(() => {});
      await new Promise(res => setTimeout(res, 800));

      const pageContent = await page.content();
      const pageText = await page.evaluate(() => (globalThis as any).document.body.innerText);
      const pageTitle = await page.title();
      const assertions: string[] = [];

      // Assertion 1: Expected text is rendered
      const hasExpectedText = pageText.toLowerCase().includes(r.expectedText.toLowerCase());
      assertions.push(hasExpectedText ? `Found expected content: "${r.expectedText}"` : `Missing expected content: "${r.expectedText}" (Actual text: "${pageText.substring(0, 200).replace(/\n/g, ' ')}")`);

      // Assertion 2: Founder name MUST NOT appear anywhere on any page!
      const hasFounderName = pageContent.toLowerCase().includes('revanth') || pageContent.toLowerCase().includes('polamreddy');
      assertions.push(!hasFounderName ? 'Founder name check: 100% Clean (0 instances)' : 'FAIL: Founder name found in rendered DOM!');

      // Assertion 3: For /admin, check that empty state is rendered for workforce capacity
      if (r.path === '/admin') {
        const hasEmptyWorkforce = pageContent.includes('No Technical Personnel Registered');
        assertions.push(hasEmptyWorkforce ? 'Workforce Capacity Section: Clean empty-state rendered' : 'Workforce Capacity Section: Active entries or custom view');
      }

      // Assertion 4: Console errors count
      assertions.push(consoleErrors.length === 0 ? 'Zero unhandled console errors' : `Encountered ${consoleErrors.length} console error(s)`);

      const passed = hasExpectedText && !hasFounderName && consoleErrors.length === 0;

      results.push({
        route: r.path,
        title: pageTitle || r.name,
        passed,
        consoleErrors,
        assertions,
      });

      console.log(passed ? `✅ ${r.name} PASSED` : `⚠️ ${r.name} has warnings/errors`);
    } catch (err: any) {
      console.error(`❌ Failed navigating to ${r.path}:`, err.message);
      results.push({
        route: r.path,
        title: r.name,
        passed: false,
        consoleErrors: [err.message],
        assertions: [`Navigation error: ${err.message}`],
      });
    } finally {
      page.off('console', onConsole);
    }
  }

  await browser.close();

  console.log('\n===============================================================');
  console.log('📋 FRONTEND E2E TEST BREAKDOWN:');
  console.log('===============================================================');

  let passedAll = true;
  for (const res of results) {
    const icon = res.passed ? '✅' : '❌';
    console.log(`\n${icon} [${res.route}] ${res.title}`);
    for (const a of res.assertions) {
      console.log(`   • ${a}`);
    }
    if (res.consoleErrors.length > 0) {
      console.log(`   ⚠️ Console Errors:`);
      for (const e of res.consoleErrors) {
        console.log(`      - ${e}`);
      }
    }
    if (!res.passed) passedAll = false;
  }

  console.log('\n===============================================================');
  if (passedAll) {
    console.log('🎉 ALL FRONTEND PAGES VERIFIED CLEAN WITH ZERO CONSOLE ERRORS.');
    process.exit(0);
  } else {
    console.log('⚠️ FRONTEND ISSUES DETECTED.');
    process.exit(1);
  }
}

verifyFrontend().catch((err) => {
  console.error('Fatal Frontend Test Error:', err);
  process.exit(1);
});
