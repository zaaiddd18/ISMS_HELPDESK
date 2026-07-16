// Usage: node scripts/exportEmployees.js <financial-year> <output-file.xlsx>
const path = require("path");
const XLSX = require("xlsx");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const pool = require("../src/db");

async function run() {
  const financialYear = process.argv[2];
  const outputFile = process.argv[3] || `employees_${financialYear}.xlsx`;

  if (!financialYear) {
    console.error("Usage: node scripts/exportEmployees.js <financial-year> <output-file.xlsx>");
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT e.cpf, e.name, e.designation, e.mobile_no, e.email, e.is_active, r.role_name, e.financial_year
       FROM employees e
       LEFT JOIN roles r ON e.role_id = r.role_id
       WHERE e.financial_year = $1
       ORDER BY e.name`,
      [financialYear]
    );

    if (rows.length === 0) {
      console.log(`No records found for FY ${financialYear}.`);
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, financialYear);
    XLSX.writeFile(workbook, outputFile);

    console.log(`Exported ${rows.length} records to ${outputFile}`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
