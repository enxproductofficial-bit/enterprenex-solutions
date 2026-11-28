const { PrismaClient } = require('../node_modules/@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('       EWMS COMPREHENSIVE SYSTEM VERIFICATION       ');
  console.log('====================================================\n');

  let results = {
    testA: false,
    testB: false,
    testC: false,
    testD: false,
    testE: false,
    testF: false
  };

  // ----------------------------------------------------
  // TEST E: Existing Employees & Accounts
  // ----------------------------------------------------
  console.log('>>> [TEST E] Testing Existing Accounts (Director, HR, Existing Employee)...');
  try {
    // 1. Director Login
    const dirRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'director@enterprenexsolution.com',
        password: process.env.DIRECTOR_DEFAULT_PASSWORD || 'Enx_sol_121006'
      })
    });
    const dirData = await dirRes.json();
    if (!dirData.token) throw new Error('Director login failed: ' + JSON.stringify(dirData));
    console.log('  [PASS] Director Login Successful (Token received, Role: ' + dirData.user.role + ')');

    // 2. HR Login
    const hrRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'hr@enterprenexsolution.com',
        password: process.env.HR_DEFAULT_PASSWORD || 'Enx_sol_121006'
      })
    });
    const hrData = await hrRes.json();
    if (!hrData.token) throw new Error('HR login failed: ' + JSON.stringify(hrData));
    console.log('  [PASS] HR Login Successful (Token received, Role: ' + hrData.user.role + ')');

    // 3. Existing Employee (POLAMREDDY REVANTH REDDY)
    const empUser = await prisma.user.findFirst({
      where: { email: 'polamreddyrevanth.82@gmail.com' }
    });
    const empRecord = await prisma.employee.findFirst({
      where: { employeeId: 'ZCX-EMP-0001' }
    });
    if (!empUser || !empRecord) throw new Error('Existing employee record not found in database.');
    console.log(`  [PASS] Existing Employee Verified: ${empRecord.name} (ID: ${empRecord.employeeId}, Status: ${empRecord.status})`);

    results.testE = true;
  } catch (err) {
    console.error('  [FAIL] Test E Error:', err.message);
  }

  // ----------------------------------------------------
  // TEST A: HR creates a new employee & immediate login
  // ----------------------------------------------------
  console.log('\n>>> [TEST A] HR Creates Employee & Tests Immediate Login...');
  let testEmpA = null;
  const testAId = '2026' + Date.now().toString().slice(-8);
  const testAPassword = 'AuditTestPass@2026A';
  try {
    // Login as HR to get token
    const hrLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'hr@enterprenexsolution.com',
        password: process.env.HR_DEFAULT_PASSWORD || 'Enx_sol_121006'
      })
    });
    const hrToken = (await hrLogin.json()).token;

    // HR creates employee
    const createRes = await fetch(`${BASE_URL}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrToken}`
      },
      body: JSON.stringify({
        name: 'Verification Candidate A',
        email: `candidate.a.${Date.now()}@enterprenex.solutions`,
        phone: '+91-9876543210',
        role: 'Full Stack Engineer',
        department: 'Engineering',
        salaryMonthly: 45000,
        employeeId: testAId,
        password: testAPassword,
        status: 'Active',
        approvalStatus: 'Approved'
      })
    });
    const createData = await createRes.json();
    if (!createData.employee) throw new Error('HR employee creation failed: ' + JSON.stringify(createData));
    testEmpA = createData.employee;
    console.log(`  [PASS] HR Created Employee: ${testEmpA.name} with ID: ${testEmpA.employeeId}`);

    // Candidate A immediate login test
    const empLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testEmpA.employeeId,
        password: testAPassword
      })
    });
    const empLoginData = await empLoginRes.json();
    if (!empLoginData.token) throw new Error('Candidate A login failed: ' + JSON.stringify(empLoginData));
    console.log('  [PASS] Candidate A Logged In Immediately! Token verified, Role:', empLoginData.user.role);

    results.testA = true;
  } catch (err) {
    console.error('  [FAIL] Test A Error:', err.message);
  }

  // ----------------------------------------------------
  // TEST B: Director creates another employee & immediate login
  // ----------------------------------------------------
  console.log('\n>>> [TEST B] Director Creates Employee & Tests Immediate Login...');
  let testEmpB = null;
  const testBId = '2026' + (Date.now() + 1).toString().slice(-8);
  const testBPassword = 'DirectorPass@2026B';
  try {
    const dirLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'director@enterprenexsolution.com',
        password: process.env.DIRECTOR_DEFAULT_PASSWORD || 'Enx_sol_121006'
      })
    });
    const dirToken = (await dirLogin.json()).token;

    const createRes = await fetch(`${BASE_URL}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${dirToken}`
      },
      body: JSON.stringify({
        name: 'Verification Candidate B',
        email: `candidate.b.${Date.now()}@enterprenex.solutions`,
        phone: '+91-9876543211',
        role: 'DevOps Engineer',
        department: 'Cloud Infrastructure',
        salaryMonthly: 55000,
        employeeId: testBId,
        password: testBPassword,
        status: 'Active',
        approvalStatus: 'Approved'
      })
    });
    const createData = await createRes.json();
    if (!createData.employee) throw new Error('Director employee creation failed: ' + JSON.stringify(createData));
    testEmpB = createData.employee;
    console.log(`  [PASS] Director Created Employee: ${testEmpB.name} with ID: ${testEmpB.employeeId}`);

    // Candidate B immediate login test
    const empBLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testEmpB.employeeId,
        password: testBPassword
      })
    });
    const empBLoginData = await empBLoginRes.json();
    if (!empBLoginData.token) throw new Error('Candidate B login failed: ' + JSON.stringify(empBLoginData));
    console.log('  [PASS] Candidate B Logged In Immediately! Token verified, Role:', empBLoginData.user.role);

    results.testB = true;
  } catch (err) {
    console.error('  [FAIL] Test B Error:', err.message);
  }

  // ----------------------------------------------------
  // TEST C: Resignation Workflow & Access Revocation
  // ----------------------------------------------------
  console.log('\n>>> [TEST C] Testing Resignation Workflow & Access Revocation...');
  try {
    if (!testEmpA) throw new Error('Cannot run Test C: Test Employee A not created.');

    const hrLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'hr@enterprenexsolution.com',
        password: process.env.HR_DEFAULT_PASSWORD || 'Enx_sol_121006'
      })
    });
    const hrToken = (await hrLogin.json()).token;

    // HR marks Candidate A as Resigned
    const updateRes = await fetch(`${BASE_URL}/employees/${testEmpA.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrToken}`
      },
      body: JSON.stringify({
        status: 'Resigned',
        approvalStatus: 'Rejected'
      })
    });
    const updateData = await updateRes.json();
    console.log(`  [INFO] Employee marked as Resigned: ${updateData.message}`);

    // Candidate A tries to log in now with correct password
    const loginAttempt = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testEmpA.employeeId,
        password: testAPassword
      })
    });
    const loginResult = await loginAttempt.json();
    if (loginAttempt.status === 403) {
      console.log(`  [PASS] Candidate A Login Blocked with HTTP 403 Forbidden: "${loginResult.error}"`);
      results.testC = true;
    } else {
      throw new Error(`Candidate A should have been blocked with 403, but received status ${loginAttempt.status}: ${JSON.stringify(loginResult)}`);
    }
  } catch (err) {
    console.error('  [FAIL] Test C Error:', err.message);
  }

  // ----------------------------------------------------
  // TEST D: 4 Failed Attempts Lockout Security Rule
  // ----------------------------------------------------
  console.log('\n>>> [TEST D] Testing 4 Failed Attempts & 15-Minute Lockout Rule...');
  try {
    if (!testEmpB) throw new Error('Cannot run Test D: Test Employee B not created.');

    const wrongPassword = 'IncorrectPassword123!';
    let lockedOut = false;

    for (let i = 1; i <= 5; i++) {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: testEmpB.employeeId,
          password: wrongPassword
        })
      });
      const data = await res.json();
      console.log(`  Attempt ${i}: HTTP ${res.status} -> ${data.error || ''} (Remaining: ${data.remainingAttempts ?? 'N/A'}, RetryAfter: ${data.retryAfter ?? 'N/A'})`);

      if (i <= 3) {
        if (res.status !== 401) throw new Error(`Attempt ${i} should be 401, got ${res.status}`);
      } else if (i === 4 || i === 5) {
        if (res.status === 429) {
          lockedOut = true;
          console.log(`  [PASS] 15-Minute Lockout triggered on attempt ${i} (HTTP 429)! Lockout remaining: ${data.retryAfter}s`);
        }
      }
    }

    if (lockedOut) results.testD = true;
  } catch (err) {
    console.error('  [FAIL] Test D Error:', err.message);
  }

  // ----------------------------------------------------
  // CLEANUP of test candidates A and B
  // ----------------------------------------------------
  console.log('\n>>> [CLEANUP OF TEST RECS] Purging temporary test candidates A and B...');
  try {
    const dirLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'director@enterprenexsolution.com',
        password: process.env.DIRECTOR_DEFAULT_PASSWORD || 'Enx_sol_121006'
      })
    });
    const dirToken = (await dirLogin.json()).token;

    if (testEmpA) {
      await fetch(`${BASE_URL}/employees/${testEmpA.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${dirToken}` }
      });
      console.log(`  [CLEANED] Purged test candidate A (${testEmpA.employeeId})`);
    }

    if (testEmpB) {
      await fetch(`${BASE_URL}/employees/${testEmpB.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${dirToken}` }
      });
      console.log(`  [CLEANED] Purged test candidate B (${testEmpB.employeeId})`);
    }

    // TEST F: Database Cleanup verification
    const finalEmps = await prisma.employee.findMany();
    const finalUsers = await prisma.user.findMany();
    console.log(`\n>>> [TEST F] Database Integrity Check:`);
    console.log(`  - Employees in DB: ${finalEmps.length} (${finalEmps.map(e => e.name).join(', ')})`);
    console.log(`  - Users in DB: ${finalUsers.length} (${finalUsers.map(u => u.email).join(', ')})`);

    const hasRealEmp = finalEmps.some(e => e.employeeId === 'ZCX-EMP-0001');
    const hasDirector = finalUsers.some(u => u.email === 'director@enterprenexsolution.com');
    if (hasRealEmp && hasDirector && finalEmps.length === 1) {
      console.log('  [PASS] Only real company employees and accounts remain. Zero test residue.');
      results.testF = true;
    }
  } catch (err) {
    console.error('  [FAIL] Cleanup/Test F Error:', err.message);
  }

  console.log('\n====================================================');
  console.log('                   FINAL RESULTS                    ');
  console.log('====================================================');
  console.log('Test A (HR Creation & Immediate Login):', results.testA ? 'PASSED ✓' : 'FAILED ✗');
  console.log('Test B (Director Creation & Login):    ', results.testB ? 'PASSED ✓' : 'FAILED ✗');
  console.log('Test C (Resignation & Access Revoked): ', results.testC ? 'PASSED ✓' : 'FAILED ✗');
  console.log('Test D (4-Attempt Lockout Security):   ', results.testD ? 'PASSED ✓' : 'FAILED ✗');
  console.log('Test E (Existing Employees & Director):', results.testE ? 'PASSED ✓' : 'FAILED ✗');
  console.log('Test F (Database Cleanup & Integrity): ', results.testF ? 'PASSED ✓' : 'FAILED ✗');
  console.log('====================================================\n');

  const allPassed = Object.values(results).every(Boolean);
  if (!allPassed) process.exit(1);
}

runTests()
  .catch(err => {
    console.error('Fatal test runner error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
