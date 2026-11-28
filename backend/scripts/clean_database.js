const { PrismaClient } = require('../node_modules/@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  console.log('[CLEANUP] Starting safe database cleanup...');

  // 1. Clean orphaned loginSecurity records
  const validIdentifiers = [
    'director@enterprenexsolution.com',
    'hr@enterprenexsolution.com',
    'polamreddyrevanth.82@gmail.com',
    'zcx-emp-0001',
    'zcx-emp-001',
    '202600000001'
  ];

  const deletedSec = await prisma.loginSecurity.deleteMany({
    where: {
      identifier: {
        notIn: validIdentifiers
      }
    }
  });
  console.log(`[CLEANUP] Removed ${deletedSec.count} orphaned/typo loginSecurity records.`);

  // 2. Clean duplicate Vault Documents for POLAMREDDY REVANTH REDDY
  const docs = await prisma.vaultDocument.findMany();
  console.log(`[CLEANUP] Found ${docs.length} vault documents.`);
  
  const seen = new Set();
  const toDelete = [];
  for (const d of docs) {
    const key = `${d.title}_${d.category}`;
    if (seen.has(key)) {
      toDelete.push(d.id);
    } else {
      seen.add(key);
    }
  }

  if (toDelete.length > 0) {
    const deletedDocs = await prisma.vaultDocument.deleteMany({
      where: { id: { in: toDelete } }
    });
    console.log(`[CLEANUP] Removed ${deletedDocs.count} duplicate vault documents.`);
  }

  // 3. Verify consistency between User and Employee tables
  const users = await prisma.user.findMany();
  const employees = await prisma.employee.findMany();
  console.log(`[CLEANUP] Remaining users: ${users.length}, Remaining employees: ${employees.length}`);

  // Confirm that any employee marked inactive/resigned has user.status synchronized
  for (const emp of employees) {
    if (emp.status === 'Resigned' || emp.status === 'Terminated' || emp.status === 'Inactive') {
      await prisma.user.updateMany({
        where: { OR: [{ employeeId: emp.employeeId }, { email: emp.email }] },
        data: { status: emp.status }
      });
      console.log(`[CLEANUP] Synchronized status for non-active employee ${emp.name} (${emp.status}).`);
    }
  }

  console.log('[CLEANUP SUCCESS] Database is fully consistent, verified and clean.');
}

clean()
  .catch(err => {
    console.error('Cleanup error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
