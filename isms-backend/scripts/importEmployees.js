// Usage: node scripts/importEmployees.js <path-to-excel-file> <financial-year e.g. 2025-26>
const path = require("path");
const XLSX = require("xlsx");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const pool = require("../src/db");

async function run() {
  const filePath = process.argv[2];
  const financialYear = process.argv[3];

  if (!filePath || !financialYear) {
    console.error("Usage: node scripts/importEmployees.js <file.xlsx> <financial-year>");
    process.exit(1);
  }

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  console.log(`Found ${rows.length} rows. Importing for FY ${financialYear}...`);

  const client = await pool.connect();
  let success = 0, failed = 0;

 clear {
    for (const row of rows) {
      const cpf = String(row.cpf || row.CPF || "").trim();
      const name = String(row.name || row.Name || "").trim();
      const designation = row.designation || row.Designation || null;
      const mobile_no = row.mobile_no || row.mobile || row.Mobile || null;
      const email = row.email || row.Email || null;
      const is_active = row.is_active !== undefined
        ? String(row.is_active).toLowerCase() === "true" || row.is_active === 1
        : true;
      const roleName = row.role || row.Role || row.role_name || null;

      if (!cpf || !name) { failed++; continue; }

      let role_id = null;
      if (roleName) {
        const roleRes = await client.query("SELECT role_id FROM roles WHERE role_name = $1", [roleName]);
        role_id = roleRes.rows[0]?.role_id || null;
      }

      try {
        await client.query(
          `INSERT INTO employees (cpf, name, designation, mobile_no, email, is_active, role_id, financial_year)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (cpf, financial_year) DO UPDATE SET
             name = EXCLUDED.name,
             designation = EXCLUDED.designation,
             mobile_no = EXCLUDED.mobile_no,
             email = EXCLUDED.email,
             is_active = EXCLUDED.is_active,
             role_id = EXCLUDED.role_id`,
          [cpf, name, designation, mobile_no, email, is_active, role_id, financialYear]
        );
        success++;
      } catch (err) {
        console.error(`Row failed (cpf=${cpf}):`, err.message);
        failed++;
      }
    }
    console.log(`Done. Imported: ${success}, Failed: ${failed}`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
