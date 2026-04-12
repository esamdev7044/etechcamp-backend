exports.findUserByEmail = async (pool, email) => {
  const result = await pool.query(
    `SELECT id, email, password_hash, failed_attempts, locked_until
     FROM esmatechcamp.users 
     WHERE email = $1 AND is_deleted = false`,
    [email],
  );
  return result.rows[0];
};

exports.createUser = async (client, email, passwordHash) => {
  const result = await client.query(
    `INSERT INTO esmatechcamp.users (email, password_hash) 
     VALUES ($1, $2)
      RETURNING id, email`,
    [email, passwordHash],
  );
  return result.rows[0];
};

exports.getUser = async (pool, userId) => {
  const result = await pool.query(
    `SELECT id, email, is_active, is_deleted 
       FROM esmatechcamp.users 
       WHERE id = $1`,
    [userId],
  );
  return result.rows[0];
};

exports.getUserRole = async (pool, userId) => {
  const result = await pool.query(
    `SELECT r.name FROM esmatechcamp.roles r
     JOIN esmatechcamp.user_roles ur ON r.id = ur.role_id
     WHERE ur.user_id = $1`,
    [userId],
  );
  return result.rows[0] ? result.rows[0].name : null;
};
exports.assignRole = async (client, userId, roleId) => {
  await client.query(
    `INSERT INTO esmatechcamp.user_roles (user_id, role_id)
      VALUES ($1, $2)`,
    [userId, roleId],
  );
};

exports.incrementFailedAttempts = async (pool, userId) => {
  await pool.query(
    `UPDATE esmatechcamp.users
     SET failed_attempts = failed_attempts + 1
     WHERE id = $1`,
    [userId],
  );
};

exports.resetFailedAttempts = async (pool, userId) => {
  await pool.query(
    `UPDATE esmatechcamp.users
     SET failed_attempts = 0, locked_until = NULL
     WHERE id = $1`,
    [userId],
  );
};

exports.lockUser = async (pool, userId, lockUntil) => {
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
