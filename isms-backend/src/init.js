const pool = require("./db");
const bcrypt = require("bcryptjs");

async function init() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(200),
        role VARCHAR(20) NOT NULL DEFAULT 'e2',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS access_requests (
        id SERIAL PRIMARY KEY,
        employee_name VARCHAR(200) NOT NULL,
        cpf_no VARCHAR(10),
        text1 TEXT,
        text2 TEXT,
        remark TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        hod_remark TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        approved_by INTEGER REFERENCES users(id),
        approved_at TIMESTAMP
      );
    `);
    await client.query(`UPDATE users SET role = 'e1' WHERE role = 'hod';`);
    await client.query(`UPDATE users SET role = 'e2' WHERE role = 'user';`);
    const e1Hash = await bcrypt.hash("e1pass123", 10);
    await client.query(
      `INSERT INTO users (username, password_hash, full_name, role)
       VALUES ('e1admin', $1, 'E1 Approver', 'e1') ON CONFLICT (username) DO NOTHING;`,
      [e1Hash]
    );
    const e2Hash = await bcrypt.hash("e2pass123", 10);
    await client.query(
      `INSERT INTO users (username, password_hash, full_name, role)
       VALUES ('e2user', $1, 'E2 Employee', 'e2') ON CONFLICT (username) DO NOTHING;`,
      [e2Hash]
    );
    const e3Hash = await bcrypt.hash("e3pass123", 10);
    await client.query(
      `INSERT INTO users (username, password_hash, full_name, role)
       VALUES ('e3user', $1, 'E3 Employee', 'e3') ON CONFLICT (username) DO NOTHING;`,
      [e3Hash]
    );
    console.log("Tables ready, old roles migrated, accounts seeded.");
    console.log("E1 -> username: e1admin | password: e1pass123");
    console.log("E2 -> username: e2user  | password: e2pass123");
    console.log("E3 -> username: e3user  | password: e3pass123");
  } finally {
    client.release();
    await pool.end();
  }
}
init().catch(console.error);
