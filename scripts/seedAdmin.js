const { AppError } = require("../common/middlewares/errorHandler");
const pool = require("../config/db");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 12;

const seedAdmin = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new AppError("Missing Admin email or Admin Password");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const roleRes = await client.query(
      `SELECT id FROM esmatechcamp.roles WHERE name = 'admin'`,
    );

    if (roleRes.rows.length === 0) {
      throw new AppError("Admin role not found");
    }

    const roleId = roleRes.rows[0].id;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const userRes = await client.query(
      `INSERT INTO esmatechcamp.users (email, password_hash) 
       VALUES ($1, $2) 
       ON CONFLICT (email) DO NOTHING 
       RETURNING id;`,
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
      console.log("Admin user created successfully");
    }

    await client.query(
      `INSERT INTO esmatechcamp.user_roles (user_id, role_id) 
       VALUES ($1, $2) 
       ON CONFLICT DO NOTHING;`,
      [userId, roleId],
    );

    await client.query("COMMIT");
    console.log("Admin seeding completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error seeding admin:", err.message);
  } finally {
    client.release();
    process.exit(0);
  }
};

seedAdmin();
