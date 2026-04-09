const pool = require("../config/db");

const seedRoles = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const roles = ["admin", "user"];

    for (const role of roles) {
      const existing = await client.query(
        `SELECT id FROM esmatechcamp.roles WHERE name = $1`,
        [role],
      );

      if (existing.rows.length > 0) continue;
      await client.query(
        `INSERT INTO esmatechcamp.roles(name) VALUES($1) ON CONFLICT (name) DO NOTHING`,
        [role],
      );
    }

    await client.query("COMMIT");
    console.log("Roles seeded successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error seeding roles:", err);
  } finally {
    client.release();
  }
};

seedRoles()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
