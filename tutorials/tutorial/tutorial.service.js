const pool = require("../../config/db");
const slugify = require("slugify");
const tutorialRepository = require("./tutorial.repository");
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
        return await tutorialRepository.checkTutorialSlug({ db: client, slug });
      },
    });

    const tutorial = await tutorialRepository.createTutorial({
      db: client,
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

exports.createTutorialTranslation = async ({ tutorialId, body }) => {
  const { title, description, lang_code } = body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (!lang_code || !title) {
      throw new AppError("Language and title are required", 400);
    }

    const translation = await tutorialRepository.upsertTutorialTranslation({
      db: client,
      tutorialId,
      lang_code,
      title,
      description,
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

exports.getAllTutorials = async (lang) => {
  if (!lang) throw new AppError("Language code is required", 400);
  const tutorials = await tutorialRepository.findAllTutorials({ pool, lang });
  return tutorials;
};

exports.getFullTutorialById = async (id, lang) => {
  const rows = await tutorialRepository.fetchFullTutorialById({
    db: pool,
    id,
    lang,
  });
  
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

exports.updateTutorial = async (id, body, file) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (!id) throw new AppError("Tutorial ID is required", 400);
    const existing = await tutorialRepository.getTutorialById({
      client,
      tutorialId: id,
    });
    if (!existing) throw new AppError("Tutorial not found", 404);

    let slug = existing.slug;
    let logo = existing.logo;

    if (body.slug) {
      slug = slugify(body.slug, { lower: true, strict: true });
    }

    if (file?.path) {
      logo = file.path;
    }
    const updatedTutorial = await tutorialRepository.updateTutorialById({
      db: client,
      slug,
      logo,
      id,
    });

    await client.query("COMMIT");
    return updatedTutorial;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.updateTutorialTranslation = async (id, body) => {
  const client = await pool.connect();
  const { title, description, lang } = body;

  try {
    await client.query("BEGIN");

    if (!id || !lang) {
      throw new AppError("Tutorial ID and language are required", 400);
    }
    const existing = await tutorialRepository.getTutorialTranslation({
      db: pool,
      id,
      lang,
    });
    if (!existing) {
      throw new AppError("Translation not found", 404);
    }
    const updatedTitle = title ?? existing.title;
    const updatedDescription = description ?? existing.description;

    const updatedTranslation =
      await tutorialRepository.updateTutorialTranslation({
        db: client,
        id,
        lang,
        updatedTitle,
        updatedDescription,
      });

    await client.query("COMMIT");
    return updatedTranslation;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.removeTutorial = async (tutorialId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (!tutorialId) {
      throw new AppError("Tutorial ID is required", 400);
    }

    const deletedTutorial = await tutorialRepository.softDeleteTutorial({
      db: client,
      tutorialId,
    });

    if (!deletedTutorial) {
      throw new AppError("Tutorial not found", 404);
    }

    await client.query("COMMIT");
    return deletedTutorial;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
