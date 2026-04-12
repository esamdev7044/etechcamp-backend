exports.create = async (client, data) => {
  const { userId, fullName, age, region, city, gender, imageUrl } = data;

  const result = await client.query(
    `INSERT INTO esmatechcamp.user_profiles
     (user_id, full_name, age, region, city, gender, profile_picture)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [userId, fullName, age, region, city, gender, imageUrl],
  );

  return result.rows[0];
};

exports.getWithUser = async (pool, userId) => {
  const result = await pool.query(
    `SELECT u.id, u.email, p.*
     FROM esmatechcamp.users u
     JOIN esmatechcamp.user_profiles p ON u.id = p.user_id
     WHERE u.id = $1`,
    [userId],
  );

  return result.rows[0];
};

exports.getByUserId = async (pool, userId) => {
  const result = await pool.query(
    `SELECT * FROM esmatechcamp.user_profiles WHERE user_id = $1`,
    [userId],
  );

  return result.rows[0];
};

exports.update = async (client, userId, updates) => {
  const fields = [];
  const values = [];
  let index = 1;

  const map = {
    fullName: "full_name",
    age: "age",
    region: "region",
    city: "city",
    gender: "gender",
    imageUrl: "profile_picture",
  };

  for (const key in updates) {
    fields.push(`${map[key]} = $${index++}`);
    values.push(updates[key]);
  }

  values.push(userId);

  const query = `
    UPDATE esmatechcamp.user_profiles
    SET ${fields.join(", ")}
    WHERE user_id = $${index}
    RETURNING *
  `;

  const result = await client.query(query, values);
  return result.rows[0];
};

exports.delete = async (pool, userId) => {
  await pool.query(
    `DELETE FROM esmatechcamp.user_profiles WHERE user_id = $1`,
    [userId],
  );
};
