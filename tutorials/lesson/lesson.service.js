const slugify = require("slugify");
const repo = require("./lesson.repository");
const { AppError } = require("../../common/middleware/errorHandler");

exports.createLesson = async (moduleId, body) => {
  if (!moduleId) {
    throw new AppError("Module ID is required", 400);
  }

  const { slug, videoUrl, order_index } = body;

  if (!slug) {
    throw new AppError("Slug is required", 400);
  }

  const baseSlug = slugify(slug, {
    lower: true,
    strict: true,
    trim: true,
  }).slice(0, 50);

  let finalSlug = baseSlug;
  let attempt = 0;
  const MAX_RETRIES = 10;

  while (attempt < MAX_RETRIES) {
    const exists = await repo.slugExists(undefined, moduleId, finalSlug);

    if (!exists) break;

    finalSlug = `${baseSlug}-${attempt + 1}`;
    attempt++;
  }

  if (attempt === MAX_RETRIES) {
    throw new AppError("Could not generate unique slug", 500);
  }

  return await repo.createLesson(
    undefined,
    moduleId,
    finalSlug,
    videoUrl || null,
    order_index || 0,
  );
};

exports.createLessonTranslation = async (lessonId, body) => {
  const SUPPORTED_LANGS = ["en", "am", "om"];

  if (!lessonId) {
    throw new AppError("Lesson ID is required", 400);
  }

  let { lang_code, title, content, practice, quiz } = body;

  if (!lang_code || !title) {
    throw new AppError("Language code and title are required", 400);
  }

  lang_code = lang_code.toLowerCase().trim();
  title = title.trim();

  if (!SUPPORTED_LANGS.includes(lang_code)) {
    throw new AppError("Unsupported language", 400);
  }

  return await repo.upsertLessonTranslation(
    undefined,
    lessonId,
    lang_code,
    title,
    content || null,
    practice || null,
    quiz || null,
  );
};

exports.getLessonsByModule = async (moduleId, lang) => {
  if (!moduleId) {
    throw new AppError("Module ID is required", 400);
  }

  const normalizedLang = lang?.toLowerCase().trim() || "en";

  return await repo.findLessonsByModule(moduleId, normalizedLang);
};

exports.getLessons = async (moduleId) => {
  if (!moduleId) {
    throw new AppError("Module ID is required", 400);
  }

  return await repo.findLessons(undefined, moduleId);
};

exports.updateLesson = async (id, body) => {
  if (!id) {
    throw new AppError("Lesson ID is required", 400);
  }

  const { slug, videoUrl, order_index } = body;

  if (!slug && videoUrl === undefined && order_index === undefined) {
    throw new AppError("Nothing to update", 400);
  }

  const fields = [];
  const values = [];
  let i = 1;

  // ✅ slug
  if (slug) {
    const formattedSlug = slugify(slug, {
      lower: true,
      strict: true,
      trim: true,
    }).slice(0, 50);

    fields.push(`slug = $${i++}`);
    values.push(formattedSlug);
  }

  // ✅ video
  if (videoUrl !== undefined) {
    fields.push(`video_url = $${i++}`);
    values.push(videoUrl || null);
  }

  // ✅ order index
  if (order_index !== undefined) {
    fields.push(`order_index = $${i++}`);
    values.push(order_index);
  }

  // WHERE id
  values.push(id);

  const { lesson, rowCount } = await repo.updateLesson(
    undefined,
    id,
    fields,
    values,
  );

  if (!rowCount) {
    throw new AppError("Lesson not found", 404);
  }

  return lesson;
};

exports.updateLessonTranslation = async (lessonId, lang, body) => {
  if (!lessonId || !lang) {
    throw new AppError("Lesson ID and language are required", 400);
  }

  const { title, content, practice, quiz } = body;

  if (!title) {
    throw new AppError("Title is required", 400);
  }

  const { translation, rowCount } =
    await repo.updateLessonTranslation(
      undefined,
      lessonId,
      lang.toLowerCase().trim(),
      { title, content, practice, quiz }
    );

  if (!rowCount) {
    throw new AppError("Lesson translation not found", 404);
  }

  return translation;
};

exports.removeLesson = async (id) => {
  if (!id) {
    throw new AppError("Lesson ID is required", 400);
  }

  const rowCount = await repo.softDeleteLesson(undefined, id);

  if (!rowCount) {
    throw new AppError("Lesson not found or already deleted", 404);
  }

  return true;
};