const pool = require("../config/db");
const repo = require("./profile.repository");
const { AppError } = require("../common/middlewares/errorHandler");

exports.createProfile = async (userId, body, file) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await repo.getByUserId(client, userId);
    if (existing) throw new AppError("Profile already exists", 409);

    const profile = await repo.create(client, {
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

exports.getPublicProfile = async (userId) => {
  const profile = await repo.getWithUser(pool, userId);

  if (!profile) throw new AppError("Profile not found", 404);
  return profile;
};

exports.getProfile = async (userId) => {
  const profile = await repo.getWithUser(pool, userId);
  if (!profile) throw new AppError("Profile not found", 404);
  return profile;
};

exports.updateProfile = async (userId, body, file) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await repo.getByUserId(client, userId);
    if (!existing) throw new AppError("Profile not found", 404);

    const updates = {};

    const allowedFields = ["fullName", "age", "region", "city", "gender"];

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (file?.path) {
      updates.imageUrl = file.path;
    }

    if (Object.keys(updates).length === 0) {
      throw new AppError("No data to update", 400);
    }

    const updated = await repo.update(client, userId, updates);

    await client.query("COMMIT");
    return updated;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.deleteProfile = async (userId) => {
  await repo.delete(userId);
};
