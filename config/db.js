require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: false,
  ssl: { rejectUnauthorized: false },
});

pool.on("connect", () => {
  console.log(
    `Postgres pool created with ${pool.totalCount} total connections`,
  );
});

module.exports = pool;
