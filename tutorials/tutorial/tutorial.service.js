const pool = require("../../config/db");
const slugify = require("slugify");
const repo = require("./tutorial.repository");
const { AppError } = require("../../common/middlewares/errorHandler");
const { generateUniqueSlug } = require("../../common/utils/generateUniqueSlug");

exports.createTutorial = async (body, file) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (!body.slug) throw new AppError("Slug is required", 400);

    const finalSlug = await generateUniqueSlug({
      base: body.slug,
      checkExists: async (slug) => {
        await repo.checkExists(slug, client);
      },
    });

    const tutorial = await repo.create(client, {
      slug: finalSlug,
      logo: file?.path || file?.secure_url || null,
    });

    await client.query("COMMIT");
    return tutorial;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.createOrUpdateTranslation = async ({
  tutorialId,
  lang_code,
  title,
  description,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (!lang_code || !title)
      throw new AppError("lang_code and title are required", 400);

    const translation = await repo.upsertTranslation(
      tutorialId,
      lang_code,
      title,
      description,
      client,
    );

    await client.query("COMMIT");
    return translation;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.getAllTutorialsByLang = async (lang) => {
  if (!lang) throw new AppError("Language code is required", 400);
  const tutorials = await repo.findAllByLanguage(lang);
  return tutorials;
};

exports.getTutorialById = async (id, lang) => {
  if (!id || !lang) throw new AppError("ID and language are required", 400);
  const tutorial = await repo.findByIdAndLang(id, lang);
  if (!tutorial) throw new AppError("Tutorial not found", 404);
  return tutorial;
};

exports.updateTutorial = async (id, body, file) => {
  if (!id) throw new AppError("Tutorial ID is required", 400);

  const updates = {};

  if (body.slug) {
    updates.slug = slugify(body.slug, { lower: true, strict: true });
  }

  if (file?.path) {
    updates.logo = file.path;
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError("No updates provided", 400);
  }
  const updatedTutorial = await repo.updateTutorialById(id, updates);
  if (!updatedTutorial) throw new AppError("Tutorial not found", 404);
  return updatedTutorial;
};

exports.updateTranslation = async (id, lang, body) => {
  if (!body.title) throw new AppError("Title is required", 400);
  const updatedTranslation = await repo.updateTranslation(id, lang, body);
  if (!updatedTranslation) throw new AppError("Translation not found", 404);
  return updatedTranslation;
};

exports.removeTutorial = async (id) => {
  const deletedTutorial = await repo.softDeleteTutorial(id);
  if (!deletedTutorial) throw new AppError("Tutorial not found", 404);
  return deletedTutorial;
};

exports.getFullTutorialById = async (id, lang) => {
  const rows = await repo.fetchFullTutorialById(id, lang);

  if (!rows.length) throw new AppError("Tutorial not found", 404);

  const tutorial = {
    id: rows[0].tutorial_id,
    slug: rows[0].tutorial_slug,
    title: rows[0].tutorial_title,
    description: rows[0].tutorial_description,
    modules: [],
  };

  const moduleMap = new Map();

  for (const row of rows) {
    if (!row.module_id) continue;

    if (!moduleMap.has(row.module_id)) {
      moduleMap.set(row.module_id, {
        id: row.module_id,
        slug: row.module_slug,
        order: row.module_order,
        title: row.module_title,
        lessons: [],
      });
      tutorial.modules.push(moduleMap.get(row.module_id));
    }

    if (row.lesson_id) {
      moduleMap.get(row.module_id).lessons.push({
        id: row.lesson_id,
        slug: row.lesson_slug,
        order: row.lesson_order,
        video_url: row.video_url,
        title: row.lesson_title,
        content: row.content,
        practice: row.practice,
        quiz: row.quiz,
      });
    }
  }

  return tutorial;
};
