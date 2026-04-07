const slugify = require("slugify");
const repo = require("./module.repository");
const { AppError } = require("../../common/middlewares/errorHandler");

exports.createModule = async ({ tutorialId, body }) => {
  const { slug } = body;

  if (!tutorialId) {
    throw new AppError("Tutorial ID is required", 400);
  }

  const baseSlug = slugify(slug, { lower: true, strict: true }).slice(0, 50);

  let finalSlug = baseSlug;
  let counter = 1;

  while (true) {
    const exists = await repo.checkSlugExists(tutorialId, finalSlug);

    if (!exists) break;

    finalSlug = `${baseSlug}-${counter++}`;

    if (counter > 10) {
      throw new AppError("Unable to generate unique slug", 500);
    }
  }

  return await repo.createModule({
    tutorialId,
    slug: finalSlug,
  });
};

exports.createModuleTranslation = async ({ moduleId, body }) => {
  const { lang_code, title } = body;

  if (!moduleId) {
    throw new AppError("Module ID is required", 400);
  }
  if (!lang_code || !title) {
    throw new AppError("Language code and title are required", 400);
  }

  const exists = await repo.checkModuleExists(moduleId);
  if (!exists) {
    throw new AppError("Module not found", 404);
  }

  return await repo.upsertModuleTranslation({
    moduleId,
    lang_code,
    title,
  });
};

exports.getModules = async ({ tutorialId }) => {
  if (!tutorialId) {
    throw new AppError("Tutorial ID is required", 400);
  }

  const exists = await repo.checkTutorialExists(tutorialId);
  if (!exists) {
    throw new AppError("Tutorial not found", 404);
  }

  return await repo.getModulesByTutorial(tutorialId);
};

exports.checkTutorialExists = async (tutorialId) => {
  const { rowCount } = await pool.query(
    `SELECT 1 FROM esmatechcamp.tutorials 
     WHERE id = $1 AND is_deleted = false`,
    [tutorialId]
  );

  return rowCount > 0;
};

exports.getModulesByTutorial = async (tutorialId) => {
  const { rows } = await pool.query(
    `SELECT 
        id AS module_id, 
        slug AS module_slug, 
        order_index
     FROM esmatechcamp.modules
     WHERE tutorial_id = $1 
     AND is_deleted = false
     ORDER BY order_index ASC`,
    [tutorialId]
  );

  return rows;
};

exports.getModulesByTutorial = async ({ tutorialId, lang }) => {
  if (!tutorialId) {
    throw new AppError("Tutorial ID is required", 400);
  }

  if (!lang) {
    throw new AppError("Language is required", 400);
  }

  const exists = await repo.checkTutorialExists(tutorialId);
  if (!exists) {
    throw new AppError("Tutorial not found", 404);
  }

  return await repo.getModulesWithTranslation(tutorialId, lang);
};

const slugify = require("slugify");
const repo = require("./module.repository");
const { AppError } = require("../../common/middleware/errorHandler");

exports.updateModule = async ({ id, body }) => {
  if (!id) {
    throw new AppError("Module ID is required", 400);
  }

  const updates = {};

  if (body.slug) {
    updates.slug = slugify(body.slug, { lower: true, strict: true });
  }

  if (body.order_index !== undefined) {
    updates.order_index = body.order_index;
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError("No data to update", 400);
  }

  const updated = await repo.updateModule(id, updates);

  if (!updated) {
    throw new AppError("Module not found", 404);
  }

  return updated;
};

exports.updateModuleTranslation = async ({ moduleId, lang, body }) => {
  if (!moduleId) {
    throw new AppError("Module ID is required", 400);
  }

  if (!lang) {
    throw new AppError("Language is required", 400);
  }

  const { title } = body;

  if (!title) {
    throw new AppError("Title is required", 400);
  }

  const updated = await repo.updateModuleTranslation({
    moduleId,
    lang,
    title,
  });

  if (!updated) {
    throw new AppError("Module translation not found", 404);
  }

  return updated;
};

exports.removeModule = async (id) => {
  if (!id) {
    throw new AppError("Module ID is required", 400);
  }

  const deleted = await repo.softDeleteModule(id);

  if (!deleted) {
    throw new AppError("Module not found", 404);
  }

  return true;
};