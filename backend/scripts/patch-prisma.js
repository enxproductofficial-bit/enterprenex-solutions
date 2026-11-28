const fs = require('fs');
const path = require('path');

const prismaBin = path.join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js');
if (fs.existsSync(prismaBin)) {
  let content = fs.readFileSync(prismaBin, 'utf8');
  const shebang = '#!/usr/bin/env node\n';
  const neonUrl = 'postgresql://neondb_owner:npg_QhISxl3XZ1Go@ep-gentle-salad-bdn7t3j3-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=30';
  const patch = `if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) { process.env.DATABASE_URL = '${neonUrl}'; }\n`;
  if (!content.includes('ep-gentle-salad-bdn7t3j3-pooler')) {
    if (content.startsWith(shebang)) {
      content = shebang + patch + content.slice(shebang.length);
    } else {
      content = patch + content;
    }
    fs.writeFileSync(prismaBin, content, 'utf8');
    console.log('✅ Patched Prisma CLI to auto-resolve Neon PostgreSQL URL');
  }
}

// Also write .env in backend directory if needed
try {
  const envPath = path.join(__dirname, '..', '.env');
  const neonUrl = 'postgresql://neondb_owner:npg_QhISxl3XZ1Go@ep-gentle-salad-bdn7t3j3-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require&connect_timeout=30';
  const envContent = `DATABASE_URL="${neonUrl}"
JWT_SECRET="enterprenex_enterprise_jwt_secret_2026_super_secure"
NODE_ENV="production"
PORT=5000
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="enxproductofficial@gmail.com"
SMTP_PASS="xbaybpssduiryqqz"
ADMIN_RECOVERY_EMAIL="enxproductofficial@gmail.com"
`;
  fs.writeFileSync(envPath, envContent, 'utf8');
} catch(e) {}
