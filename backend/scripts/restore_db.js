const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const argon2 = require('argon2');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../node_modules/@prisma/client');
const prisma = new PrismaClient();

async function restore() {
  console.log('[RESTORE] Reading backup file...');
  const backupFile = path.join(__dirname, '../backups/db_backup_2026-11-28T04-34-26-433Z.json');
  const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

  const directorPass = 'Enx_sol_121006';
  const directorHash = await argon2.hash(directorPass, { type: argon2.argon2id });

  const hrPass = 'Enx_sol_121006';
  const hrHash = await argon2.hash(hrPass, { type: argon2.argon2id });

  console.log('[RESTORE] Upserting Director user...');
  await prisma.user.upsert({
    where: { email: 'director@enterprenexsolution.com' },
    update: {
      password: directorHash,
      role: 'Super Admin',
      status: 'Active',
      mustChangePassword: false,
      employeeId: '202600000001'
    },
    create: {
      email: 'director@enterprenexsolution.com',
      password: directorHash,
      name: 'Managing Director',
      role: 'Super Admin',
      employeeId: '202600000001',
      department: 'Executive Board',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'Active',
      mustChangePassword: false
    }
  });

  console.log('[RESTORE] Upserting HR user...');
  await prisma.user.upsert({
    where: { email: 'hr@enterprenexsolution.com' },
    update: {
      password: hrHash,
      role: 'Project Manager',
      status: 'Active',
      mustChangePassword: false
    },
    create: {
      email: 'hr@enterprenexsolution.com',
      password: hrHash,
      name: 'HR Administrator',
      role: 'Project Manager',
      department: 'Human Resources',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'Active',
      mustChangePassword: false
    }
  });

  // Restore Employee POLAMREDDY REVANTH REDDY
  const empBackup = backup.employee.find(e => e.employeeId === 'ZCX-EMP-0001' || e.name.includes('POLAMREDDY'));
  if (empBackup) {
    console.log('[RESTORE] Restoring Employee:', empBackup.name);
    const { id, createdAt, updatedAt, ...empData } = empBackup;
    await prisma.employee.upsert({
      where: { employeeId: empBackup.employeeId },
      update: { ...empData, status: 'Active', approvalStatus: 'Approved' },
      create: { ...empData, status: 'Active', approvalStatus: 'Approved' }
    });
  }

  // Restore User for POLAMREDDY REVANTH REDDY
  const userBackup = backup.user.find(u => u.email === 'polamreddyrevanth.82@gmail.com');
  if (userBackup) {
    console.log('[RESTORE] Restoring User:', userBackup.email);
    const { id, createdAt, updatedAt, ...userData } = userBackup;
    await prisma.user.upsert({
      where: { email: userBackup.email },
      update: { ...userData, status: 'Active' },
      create: { ...userData, status: 'Active' }
    });
  }

  // Reset login security lockouts so Director is not locked out
  await prisma.loginSecurity.deleteMany({
    where: {
      identifier: { in: ['director@enterprenexsolution.com', '202600000001', 'hr@enterprenexsolution.com'] }
    }
  });

  // Verify
  const users = await prisma.user.findMany();
  const emps = await prisma.employee.findMany();
  console.log('\n[RESTORE SUCCESS]');
  console.log('Users in DB (' + users.length + '):', users.map(u => ({ email: u.email, role: u.role, status: u.status })));
  console.log('Employees in DB (' + emps.length + '):', emps.map(e => ({ name: e.name, employeeId: e.employeeId, status: e.status })));
}

restore()
  .catch(err => {
    console.error('Restore failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
