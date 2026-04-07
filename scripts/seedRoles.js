const pool = require("../config/db");
const seedRoles = async () => {
  const roles = ["admin", "user"];

  for (const role of roles) {
    const existing = await pool.query(
      `SELECT id FROM esmatechcamp.roles WHERE name = $1`,[role],
    );
    if (existing.rows.length > 0) {
      continue;
    }
    await pool.query(
      `INSERT INTO esmatechcamp.roles(name) VALUES($1) ON CONFLICT (name) DO NOTHING`, [role],
    );
  }
};

seedRoles();
