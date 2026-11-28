const fs = require('fs');
const path = require('path');

const backupFiles = fs.readdirSync(path.join(__dirname, '..', 'backups'))
  .filter(f => f.startsWith('db_backup_'))
  .sort()
  .reverse();

if (backupFiles.length === 0) {
  console.error('No backup file found.');
  process.exit(1);
}

const latestBackup = path.join(__dirname, '..', 'backups', backupFiles[0]);
console.log('Analyzing latest backup:', latestBackup);
const data = JSON.parse(fs.readFileSync(latestBackup, 'utf8'));

console.log('\n=== USERS (' + data.user.length + ') ===');
data.user.forEach(u => {
  console.log(`- ID: ${u.id} | Email: ${u.email} | EmpID: ${u.employeeId} | Role: ${u.role} | Status: ${u.status}`);
});

console.log('\n=== EMPLOYEES (' + data.employee.length + ') ===');
data.employee.forEach(e => {
  console.log(`- ID: ${e.id} | Name: ${e.name} | EmpID: ${e.employeeId} | Email: ${e.email} | Status: ${e.status} | Role: ${e.role}`);
});

console.log('\n=== LOGIN SECURITY (' + data.loginSecurity.length + ') ===');
data.loginSecurity.forEach(l => {
  console.log(`- Identifier: ${l.identifier} | Failed: ${l.failedAttempts} | LockedUntil: ${l.lockedUntil}`);
});

console.log('\n=== VAULT DOCUMENTS (' + (data.vaultDocument ? data.vaultDocument.length : 0) + ') ===');
(data.vaultDocument || []).forEach(d => {
  console.log(`- Title: ${d.title} | Category: ${d.category} | FileUrl: ${d.fileUrl}`);
});
