const pool = require("../../config/db");

exports.findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id, email, password_hash, failed_attempts, locked_until
     FROM esmatechcamp.users 
     WHERE email = $1 AND is_deleted = false`,
    [email],
  );
  return result.rows[0];
};

exports.getUser = async (userId) => {
  const result = await pool.query(
    `SELECT id, email, is_active, is_deleted 
       FROM esmatechcamp.users 
       WHERE id = $1`,
    [userId],
  );
  return result.rows[0];
};

exports.incrementFailedAttempts = async (userId) => {
  await pool.query(
    `UPDATE esmatechcamp.users
     SET failed_attempts = failed_attempts + 1
     WHERE id = $1`,
    [userId],
  );
};

exports.resetFailedAttempts = async (userId) => {
  await pool.query(
    `UPDATE esmatechcamp.users
     SET failed_attempts = 0, locked_until = NULL
     WHERE id = $1`,
    [userId],
  );
};

exports.lockUser = async (userId, lockUntil) => {
  await pool.query(
    `UPDATE esmatechcamp.users
     SET locked_until = $1
     WHERE id = $2`,
    [lockUntil, userId],
  );
};

exports.createSession = async (client, sessionData) => {
  const { userId, refreshTokenHash, ip, os, browser, location } = sessionData;

  await client.query(
    `INSERT INTO esmatechcamp.user_sessions
     (user_id, refresh_token, ip_address, os, browser, location, expires_at)
     VALUES($1,$2,$3,$4,$5,$6, NOW() + INTERVAL '1 day')`,
    [userId, refreshTokenHash, ip, os, browser, location],
  );
};

exports.findSessionByTokenHash = async (tokenHash) => {
  const result = await pool.query(
    `SELECT * FROM esmatechcamp.user_sessions 
     WHERE refresh_token = $1 AND is_revoked = false`,
    [tokenHash],
  );
  return result.rows[0];
};

exports.revokeSessionByHash = async (tokenHash) => {
  await pool.query(
    `UPDATE esmatechcamp.user_sessions 
     SET is_revoked = true 
     WHERE refresh_token = $1`,
    [tokenHash],
  );
};

exports.revokeAllUserSessions = async (userId, client) => {
  await client.query(
    `UPDATE esmatechcamp.user_sessions
     SET is_revoked = true
     WHERE user_id = $1`,
    [userId],
  );
};

exports.createProfile = async (client, data) => {
  const { userId, fullName, age, region, city, gender, imageUrl } = data;

  const result = await client.query(
    `INSERT INTO esmatechcamp.user_profiles
     (user_id, full_name, age, region, city, gender, profile_picture)
     VALUES($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [userId, fullName, age, region, city, gender, imageUrl],
  );

  return result.rows[0];
};

exports.getProfile = async (userId) => {
  const result = await pool.query(
    `SELECT u.id, u.email, p.* FROM esmatechcamp.users u
     JOIN esmatechcamp.user_profiles p ON u.id = p.user_id
     WHERE u.id = $1`,
    [userId],
  );

  return result.rows[0];
};

exports.getProfileByUserId = async (client, userId) => {
  const result = await client.query(
    `SELECT * FROM esmatechcamp.user_profiles WHERE user_id = $1`,
    [userId],
  );

  return result.rows[0];
};

exports.updateProfile = async (client, fields, values, userId) => {
  values.push(userId);

  const query = `
    UPDATE esmatechcamp.user_profiles
    SET ${fields.join(", ")}
    WHERE user_id = $${values.length}
    RETURNING *;
  `;

  const result = await client.query(query, values);
  return result.rows[0];
};

exports.findUserById = async (client, userId) => {
  const result = await client.query(
    `SELECT id, is_deleted FROM esmatechcamp.users WHERE id = $1`,
    [userId],
  );
  return result.rows[0];
};

exports.softDeleteUser = async (client, userId) => {
  await client.query(
    `UPDATE esmatechcamp.users
     SET is_deleted = true, is_active = false
     WHERE id = $1`,
    [userId],
  );
};
