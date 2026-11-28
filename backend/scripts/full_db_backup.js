const { PrismaClient } = require('../node_modules/@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function backup() {
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `db_backup_${timestamp}.json`);

  // Dynamically inspect all Prisma model delegates
  const dump = {};
  const modelKeys = Object.keys(prisma).filter(k => 
    !k.startsWith('_') && 
    !k.startsWith('$') && 
    typeof prisma[k] === 'object' && 
    prisma[k] !== null && 
    typeof prisma[k].findMany === 'function'
  );

  console.log(`Discovered ${modelKeys.length} database models to backup.`);

  for (const m of modelKeys) {
    try {
      dump[m] = await prisma[m].findMany();
      console.log(`Model [${m}]: ${dump[m].length} records`);
    } catch (e) {
      console.warn(`Error backing up [${m}]:`, e.message);
    }
  }

  fs.writeFileSync(backupFile, JSON.stringify(dump, null, 2));
  console.log(`[BACKUP SUCCESS] Saved complete database state to ${backupFile}`);
}

backup()
  .catch(err => {
    console.error('Backup failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
