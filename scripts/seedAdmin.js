const pool = require("../config/db");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 12;

const seedAdmin = async () => {
  const client = await pool.connect();
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const roleRes = await client.query(
      `SELECT id FROM esmatechcamp.roles WHERE name = 'admin'`,
    );

    if (roleRes.rows.length === 0) {
      throw new Error("Admin role not found");
    }

    const roleId = roleRes.rows[0].id;

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userRes = await client.query(
      `INSERT INTO esmatechcamp.users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING RETURNING id, email;`,
      [normalizedEmail, passwordHash],
    );

    let userId;

    if (userRes.rows.length === 0) {
      const existingUser = await client.query(
        `SELECT id FROM esmatechcamp.users WHERE email = $1`,
        [normalizedEmail],
      );
      userId = existingUser.rows[0].id;
    } else {
      userId = userRes.rows[0].id;
      userRes.status(200).json({ message: "Admin created seccussfully" });
    }
    await client.query(
      `INSERT INTO esmatechcamp.user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
      [userId, roleId],
    );
  } catch (err) {
    if (process.env.MOD_ENV === "development") {
      console.error("Seed failed:", err.message);
    }
  } finally {
    client.release();
    process.exit(0);
  }
};

seedAdmin();
