const slugify = require("slugify");
const pool = require("../../config/db");

const moduleRepository = require("./module.repository");
const { AppError } = require("../../common/middlewares/errorHandler");
const { generateUniqueSlug } = require("../../common/utils/generateUniqueSlug");

exports.createModule = async ({ tutorialId, body }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (!tutorialId) {
      throw new AppError("Tutorial ID is required", 400);
    }

    const { slug } = body;
    if (!slug) {
      throw new AppError("Slug is required", 400);
    }

    const baseSlug = slugify(slug, { lower: true, strict: true }).slice(0, 50);

    const finalSlug = await generateUniqueSlug({
      base: baseSlug,
      checkExists: async (slug) => {
        return await moduleRepository.checkSlugExists({
          db: client,
          tutorialId,
          slug,
        });
      },
    });

    const module = await moduleRepository.createModule({
      db: client,
      tutorialId,
      slug: finalSlug,
    });

    await client.query("COMMIT");
    return module;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.createModuleTranslation = async ({ moduleId, body }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { lang_code, title } = body;

    if (!moduleId) {
      throw new AppError("Module ID is required", 400);
    }

    if (!lang_code || !title) {
      throw new AppError("Language code and title are required", 400);
    }

    const exists = await moduleRepository.checkModuleExists({
      db: client,
      moduleId,
    });

    if (!exists) {
      throw new AppError("Module not found", 404);
    }

    const translation = await moduleRepository.upsertModuleTranslation({
      db: client,
      moduleId,
      lang_code,
      title,
    });

    await client.query("COMMIT");
    return translation;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.getModulesByTutorial = async ({ tutorialId, lang = "en" }) => {
  if (!tutorialId) {
    throw new AppError("Tutorial ID is required", 400);
  }

  const exists = await moduleRepository.checkTutorialExists({
    db: pool,
    tutorialId,
  });
  if (!exists) {
    throw new AppError("Tutorial not found", 404);
  }

  return await moduleRepository.getModulesWithTranslation({
    db: pool,
    tutorialId,
    lang,
  });
};

exports.updateModule = async ({ id, body }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    if (!id) {
      throw new AppError("Module ID is required", 400);
    }
    let slug;
    if (body.slug) {
      slug = slugify(body.slug, { lower: true, strict: true });
    }

    const updated = await moduleRepository.updateModule({
      db: client,
      id,
      slug,
    });
    if (!updated) {
      throw new AppError("Module not found", 404);
    }

    await client.query("COMMIT");
    return updated;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
exports.updateModuleTranslation = async ({ moduleId, body }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const { title, lang } = body;
    if (!moduleId) {
      throw new AppError("Module ID is required", 400);
    }

    if (!lang) {
      throw new AppError("Language is required", 400);
    }

    if (!title) {
      throw new AppError("Title is required", 400);
    }

    const updated = await moduleRepository.updateModuleTranslation({
      db: client,
      moduleId,
      lang,
      title,
    });

    if (!updated) {
      throw new AppError("Module translation not found", 404);
    }

    await client.query("COMMIT");
    return updated;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.removeModule = async (id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (!id) {
      throw new AppError("Module ID is required", 400);
    }

    const deleted = await moduleRepository.softDeleteModule({
      db: client,
      id,
    });

    if (!deleted) {
      throw new AppError("Module not found", 404);
    }

    await client.query("COMMIT");
    return deleted;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
