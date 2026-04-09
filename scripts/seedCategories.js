const pool = require("../config/db");
const slugify = require("slugify");

const categories = ["Technology", "Programming", "AI", "Web Development"];

const seedCategories = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const name of categories) {
      const slug = slugify(name, { lower: true, strict: true });
      const existing = await client.query(
        `SELECT id FROM esmatechcamp.categories WHERE slug = $1`,
        [slug]
      );

      if (existing.rows.length > 0) continue;
      await client.query(
        `INSERT INTO esmatechcamp.categories (name, slug) VALUES ($1, $2)`,
        [name, slug]
      );
    }

    await client.query("COMMIT");
    console.log("Categories seeded successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error seeding categories:", err.message);
  } finally {
    client.release();
    process.exit(0);
  }
};

seedCategories();