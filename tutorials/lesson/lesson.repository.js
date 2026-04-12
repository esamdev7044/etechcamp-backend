const TABLE = "esmatechcamp.lessons";
const TRANSLATION_TABLE = "esmatechcamp.lessons_translation";

exports.slugExists = async ({ db, moduleId, slug }) => {
  const result = await db.query(
    `SELECT 1 FROM ${TABLE} WHERE module_id = $1 
      AND slug = $2
      AND is_deleted = false`,
    [moduleId, slug],
  );

  return result.rowCount > 0;
};

exports.createLesson = async ({ db, moduleId, slug, videoUrl }) => {
  const result = await db.query(
    `INSERT INTO ${TABLE} (module_id, slug, video_url, order_index)
     VALUES ( $1, $2, $3, COALESCE(
     (SELECT MAX(order_index) + 1 FROM ${TABLE} WHERE module_id = $1), 1 ))
     RETURNING *`,
    [moduleId, slug, videoUrl],
  );

  return result.rows[0];
};

exports.upsertLessonTranslation = async ({
  db,
  lessonId,
  langCode,
  title,
  content,
  practice,
  quiz,
}) => {
  const result = await db.query(
    `INSERT INTO ${TRANSLATION_TABLE} (lesson_id, lang_code, title, content, practice, quiz)
     VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (lesson_id, lang_code) DO UPDATE SET
       title = EXCLUDED.title,
       content = EXCLUDED.content,
       practice = EXCLUDED.practice,
       quiz = EXCLUDED.quiz,
       updated_at = NOW()
     RETURNING *`,
    [lessonId, langCode, title, content, practice, quiz],
  );

  return result.rows[0];
};

exports.findLessonsByModule = async ({
  db,
  moduleId,
  lang,
  fallbackLang = "en",
}) => {
  const result = await db.query(
    `SELECT l.id, l.slug, l.video_url, l.order_index, l.created_at,
    COALESCE(lt.title, lft.title) AS title,
    COALESCE(lt.content, lft.content) AS content,
    COALESCE(lt.practice, lft.practice) AS practice,
    COALESCE(lt.quiz, lft.quiz) AS quiz,
    COALESCE(lt.lang_code, lft.lang_code) AS lang_code
    FROM ${TABLE} l LEFT JOIN ${TRANSLATION_TABLE} lt ON l.id = lt.lesson_id AND lt.lang_code = $2
    LEFT JOIN ${TRANSLATION_TABLE} lft
    ON l.id = lft.lesson_id AND lft.lang_code = $3
    WHERE l.module_id = $1 AND l.is_deleted = false ORDER BY l.order_index ASC`,
    [moduleId, lang, fallbackLang],
  );

  return result.rows;
};

exports.findLessons = async ({ db, moduleId }) => {
  const result = await db.query(
    `SELECT id, slug, video_url, order_index
     FROM ${TABLE} WHERE module_id = $1 AND is_deleted = false
     ORDER BY order_index ASC`,
    [moduleId],
  );

  return result.rows;
};

exports.updateLesson = async ({ db, id, slug, videoUrl, orderIndex }) => {
  const result = await db.query(
    `UPDATE ${TABLE}
     SET slug = $1, video_url = $2, order_index = $3, updated_at = NOW()
     WHERE id = $4
       AND is_deleted = false
     RETURNING *`,
    [slug, videoUrl, orderIndex, id],
  );

  return { lesson: result.rows[0], rowCount: result.rowCount };
};

exports.updateLessonTranslation = async ({ db, lessonId, lang, payload }) => {
  const { title, content, practice, quiz } = payload;

  const result = await db.query(
    `UPDATE ${TRANSLATION_TABLE} SET title = $1, content = $2, practice = $3, quiz = $4, updated_at = NOW()
     WHERE lesson_id = $5 AND lang_code = $6
     RETURNING *`,
    [title, content, practice, quiz, lessonId, lang],
  );

  return { translation: result.rows[0], rowCount: result.rowCount };
};

exports.softDeleteLesson = async ({ db, id }) => {
  const result = await db.query(
    `UPDATE ${TABLE} SET is_deleted = true, updated_at = NOW()
     WHERE id = $1 AND is_deleted = false
     RETURNING *`,
    [id],
  );

  return result.rows[0];
};
