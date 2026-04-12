const slugify = require("slugify");
const pool = require("../../config/db");

const lessonRepository = require("./lesson.repository");
const { AppError } = require("../../common/middlewares/errorHandler");
const { generateUniqueSlug } = require("../../common/utils/generateUniqueSlug");

exports.createLesson = async ({ moduleId, body }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (!moduleId) {
      throw new AppError("Module ID is required", 400);
    }

    const { slug, videoUrl } = body;

    if (!slug) {
      throw new AppError("Slug is required", 400);
    }

    const baseSlug = slugify(slug, {
      lower: true,
      strict: true,
      trim: true,
    }).slice(0, 50);

    const finalSlug = await generateUniqueSlug({
      base: baseSlug,
      checkExists: async (slug) => {
        return await lessonRepository.slugExists({
          db: client,
          moduleId,
          slug,
        });
      },
    });

    const lesson = await lessonRepository.createLesson({
      db: client,
      moduleId,
      slug: finalSlug,
      videoUrl: videoUrl || null,
    });

    await client.query("COMMIT");
    return lesson;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.createLessonTranslation = async ({ lessonId, body }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const SUPPORTED_LANGS = ["en", "am", "om"];

    if (!lessonId) {
      throw new AppError("Lesson ID is required", 400);
    }

    let { lang_code, title, content, practice, quiz } = body;

    if (!lang_code || !title) {
      throw new AppError("Language code and title are required", 400);
    }

    lang_code = lang_code.toLowerCase().trim();

    if (!SUPPORTED_LANGS.includes(lang_code)) {
      throw new AppError("Unsupported language", 400);
    }

    const translation = await lessonRepository.upsertLessonTranslation({
      db: client,
      lessonId,
      langCode: lang_code,
      title: title.trim(),
      content: content,
      practice: practice,
      quiz: quiz,
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

exports.getLessonsByModule = async ({ moduleId, lang }) => {
  if (!moduleId) {
    throw new AppError("Module ID is required", 400);
  }

  return await lessonRepository.findLessonsByModule({
    db: pool,
    moduleId,
    lang: lang?.toLowerCase().trim() || "en",
  });
};

exports.getLessons = async ({ moduleId }) => {
  if (!moduleId) {
    throw new AppError("Module ID is required", 400);
  }

  return await lessonRepository.findLessons({
    db: pool,
    moduleId,
  });
};

exports.updateLesson = async ({ id, body }) => {
  const { slug, video_url, order_index } = body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (!id) {
      throw new AppError("Lesson ID is required", 400);
    }

    if (body.slug) {
      slug = slugify(body.slug, {
        lower: true,
        strict: true,
        trim: true,
      }).slice(0, 50);
    }

    const { lesson, rowCount } = await lessonRepository.updateLesson({
      db: client,
      id,
      slug,
      videoUrl: video_url,
      orderIndex: order_index,
    });

    if (!rowCount) {
      throw new AppError("Lesson not found", 404);
    }

    await client.query("COMMIT");
    return lesson;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.updateLessonTranslation = async ({ lessonId, lang, body }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (!lessonId || !lang) {
      throw new AppError("Lesson ID and language are required", 400);
    }

    const { title, content, practice, quiz } = body;

    if (!title) {
      throw new AppError("Title is required", 400);
    }
    
    const { translation, rowCount } =
      await lessonRepository.updateLessonTranslation({
        db: client,
        lessonId,
        lang: lang.toLowerCase().trim(),
        payload: { title, content, practice, quiz },
      });

    if (!rowCount) {
      throw new AppError("Lesson translation not found", 404);
    }

    await client.query("COMMIT");
    return translation;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.removeLesson = async (id) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (!id) {
      throw new AppError("Lesson ID is required", 400);
    }
    const deleted = await lessonRepository.softDeleteLesson({
      db: client,
      id,
    });

    if (!deleted) {
      throw new AppError("Lesson not found or already deleted", 404);
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
