'use strict';
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('../db');

async function main() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  const tenantId = process.env.PUBLIC_TENANT_ID || process.env.TENANT_ID;
  const name = process.env.ADMIN_NAME || process.env.BOOTSTRAP_ADMIN_NAME || 'Runtime Admin';
  if (!email.includes('@')) throw new Error('ADMIN_EMAIL is required');
  if (password.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters');
  if (!tenantId) throw new Error('PUBLIC_TENANT_ID or TENANT_ID is required');
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO advisory_identities(id,tenant_id,email,password_hash,name,role)
     VALUES($1,$2,$3,$4,$5,'admin')
     ON CONFLICT(tenant_id,email) DO UPDATE SET password_hash=EXCLUDED.password_hash,name=EXCLUDED.name,role='admin',disabled_at=NULL`,
    [crypto.randomUUID(), tenantId, email, passwordHash, name],
  );
  process.stdout.write(`provisioned ${email}\n`);
}

main().then(() => pool.end()).catch(async error => {
  console.error(error.message);
  await pool.end().catch(() => {});
  process.exitCode = 1;
});
