const pool = require("../../config/db");

exports.slugExists = async (db = pool, moduleId, slug) => {
  const { rowCount } = await db.query(
    `SELECT 1 
     FROM esmatechcamp.lessons 
     WHERE module_id = $1 AND slug = $2`,
    [moduleId, slug],
  );

  return rowCount > 0;
};

exports.createLesson = async (
  db = pool,
  moduleId,
  slug,
  videoUrl,
  orderIndex,
) => {
  const { rows } = await db.query(
    `INSERT INTO esmatechcamp.lessons 
      (module_id, slug, video_url, order_index)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [moduleId, slug, videoUrl, orderIndex],
  );

  return rows[0];
};

exports.upsertLessonTranslation = async (
  db = pool,
  lessonId,
  langCode,
  title,
  content,
  practice,
  quiz,
) => {
  const { rows } = await db.query(
    `INSERT INTO esmatechcamp.lessons_translation
      (lesson_id, lang_code, title, content, practice, quiz)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (lesson_id, lang_code)
     DO UPDATE SET
       title = EXCLUDED.title,
       content = EXCLUDED.content,
       practice = EXCLUDED.practice,
       quiz = EXCLUDED.quiz,
       updated_at = NOW()
     RETURNING *`,
    [lessonId, langCode, title, content, practice, quiz],
  );

  return rows[0];
};

exports.findLessonsByModule = async (
  db = pool,
  moduleId,
  lang,
  fallbackLang = "en"
) => {
  const { rows } = await db.query(
    `SELECT 
        l.id AS lesson_id,
        l.slug AS lesson_slug,
        l.video_url AS lesson_video_url,
        l.order_index,
        l.created_at AS lesson_created_at,

        COALESCE(lt.title, lft.title) AS lesson_title,
        COALESCE(lt.content, lft.content) AS lesson_content,
        COALESCE(lt.practice, lft.practice) AS lesson_practice,
        COALESCE(lt.quiz, lft.quiz) AS lesson_quiz,
        COALESCE(lt.lang_code, lft.lang_code) AS lesson_lang_code

     FROM esmatechcamp.lessons l

     LEFT JOIN esmatechcamp.lessons_translation lt
       ON l.id = lt.lesson_id AND lt.lang_code = $2

     LEFT JOIN esmatechcamp.lessons_translation lft
       ON l.id = lft.lesson_id AND lft.lang_code = $3

     WHERE l.module_id = $1 
       AND l.is_deleted = false

     ORDER BY l.order_index ASC`,
    [moduleId, lang, fallbackLang]
  );

  return rows;
};

exports.findLessons = async (db = pool, moduleId) => {
  const { rows } = await db.query(
    `SELECT 
        id AS lesson_id,
        slug AS lesson_slug,
        video_url AS lesson_video_url,
        order_index
     FROM esmatechcamp.lessons
     WHERE module_id = $1 
       AND is_deleted = false
     ORDER BY order_index ASC`,
    [moduleId]
  );

  return rows;
};

exports.updateLesson = async (db = pool, id, fields, values) => {
  const { rows, rowCount } = await db.query(
    `UPDATE esmatechcamp.lessons
     SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${values.length} 
       AND is_deleted = false
     RETURNING *`,
    values
  );

  return { lesson: rows[0], rowCount };
};

exports.updateLessonTranslation = async (
  db = pool,
  lessonId,
  lang,
  payload
) => {
  const { title, content, practice, quiz } = payload;

  const { rows, rowCount } = await db.query(
    `UPDATE esmatechcamp.lessons_translation
     SET 
       title = $1,
       content = $2,
       practice = $3,
       quiz = $4,
       updated_at = NOW()
     WHERE lesson_id = $5 
       AND lang_code = $6
     RETURNING *`,
    [
      title,
      content || null,
      practice || null,
      quiz || null,
      lessonId,
      lang,
    ]
  );

  return { translation: rows[0], rowCount };
};

exports.softDeleteLesson = async (db = pool, id) => {
  const { rowCount } = await db.query(
    `UPDATE esmatechcamp.lessons
     SET is_deleted = true,
         updated_at = NOW()
     WHERE id = $1
       AND is_deleted = false`,
    [id]
  );

  return rowCount;
};