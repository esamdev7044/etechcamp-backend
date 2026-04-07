const bcrypt = require("bcrypt");
const crypto = require("crypto");
const pool = require("../../config/db");
const repo = require("./auth.repository");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/tokens");
const UAParser = require("ua-parser-js");
const getClientIp = require("../../utils/getClientIp");
const getLocationFromIp = require("../../utils/getLocationFromIp");
const { AppError } = require("../common/middlewares/errorHandler");

const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;

exports.registerUser = async ({ email, password }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await repo.findUserByEmail(email);
    if (existing) {
      throw new AppError("Email already exists", 409);
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await repo.createUser(client, email, hashed);

    const roleId = await repo.getUserRoleId(client);
    if (!roleId) throw new AppError("Role not found", 500);

    await repo.assignRole(client, user.id, roleId);

    await client.query("COMMIT");

    return user;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.loginUser = async (req, { email, password }) => {
  const client = await pool.connect();

  try {
    const user = await repo.findUserByEmail(email);
    if (!user) throw new AppError("Invalid credentials", 401);

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new AppError("Account locked. Try again later.", 423);
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      await repo.incrementFailedAttempts(user.id);

      if (user.failed_attempts + 1 >= MAX_FAILED_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCK_TIME_MINUTES * 60 * 1000);
        await repo.lockUser(user.id, lockUntil);
      }

      throw new AppError("Invalid credentials", 401);
    }

    await repo.resetFailedAttempts(user.id);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const parser = new UAParser(req.headers["user-agent"]);
    const ip = getClientIp(req);
    const location = await getLocationFromIp(ip);

    await client.query("BEGIN");

    await repo.createSession(client, {
      userId: user.id,
      refreshTokenHash,
      ip,
      os: parser.getOS().name,
      browser: parser.getBrowser().name,
      location,
    });

    await client.query("COMMIT");

    return { accessToken, refreshToken };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.refreshToken = async (token) => {
  if (!token) {
    throw new AppError("No refresh token provided", 401);
  }

  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN);

  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  const session = await repo.findSessionByTokenHash(hashed);

  if (!session) {
    throw new AppError("Invalid session", 403);
  }

  return generateAccessToken({
    id: decoded.id,
    is_active: decoded.is_active,
    is_deleted: decoded.is_deleted,
  });
};

exports.logout = async (token) => {
  if (token) {
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    await repo.revokeSessionByHash(hashed);
  }
};

exports.createProfile = async (userId, body, file) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const profile = await repo.createProfile(client, {
      userId,
      ...body,
      imageUrl: file?.path || null,
    });

    await client.query("COMMIT");

    return profile;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.getProfile = async (userId) => {
  return await repo.getProfile(userId);
};

exports.updateProfile = async (userId, body, file) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await repo.getProfileByUserId(client, userId);

    if (!existing) throw new AppError("Profile not found", 404);

    const fields = [];
    const values = [];
    let index = 1;

    const map = {
      fullName: "full_name",
      age: "age",
      region: "region",
      city: "city",
      gender: "gender",
    };

    for (const key in map) {
      if (body[key]) {
        fields.push(`${map[key]} = $${index++}`);
        values.push(body[key]);
      }
    }

    if (file?.path) {
      fields.push(`profile_picture = $${index++}`);
      values.push(file.path);
    }

    if (fields.length === 0) throw new AppError("No data to update", 400);

    const updated = await repo.updateProfile(client, fields, values, userId);

    await client.query("COMMIT");

    return updated;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.deleteUser = async (userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const user = await repo.findUserById(client, userId);

    if (!user) throw new AppError("User not found", 404);
    if (user.is_deleted) throw new AppError("User already deleted", 400);

    await repo.softDeleteUser(client, userId);
    await repo.revokeAllUserSessions(userId, client);

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
