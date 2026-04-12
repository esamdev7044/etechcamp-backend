exports.checkTutorialSlug = async ({ db, slug }) => {
  const res = await db.query(
    "SELECT slug FROM esmatechcamp.tutorials WHERE slug = $1",
    [slug],
  );
  return res.rowCount > 0;
};

exports.createTutorial = async ({ db, slug, logo }) => {
  const res = await db.query(
    `INSERT INTO esmatechcamp.tutorials (slug, logo)
     VALUES ($1, $2)
     RETURNING *`,
    [slug, logo],
  );
  return res.rows[0];
};

exports.upsertTutorialTranslation = async ({
  db,
  tutorialId,
  lang_code,
  title,
  description,
}) => {
  const res = await db.query(
    `INSERT INTO esmatechcamp.tutorials_translation
     (tutorial_id, lang_code, title, description)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (tutorial_id, lang_code)
     DO UPDATE SET 
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       updated_at = NOW()
     RETURNING *`,
    [tutorialId, lang_code, title, description],
  );
  return res.rows[0];
};

exports.findAllTutorials = async ({ db, lang }) => {
  let query = `SELECT t.id, t.slug, t.logo, tt.title, tt.description
    FROM esmatechcamp.tutorials t
    LEFT JOIN esmatechcamp.tutorials_translation tt
      ON t.id = tt.tutorial_id
    WHERE t.is_deleted = false`;
  const values = [];
  if (lang) {
    values.push(lang);
    query += ` AND tt.lang_code = $${values.length}`;
  }

  query += ` ORDER BY t.created_at ASC`;

  const result = await db.query(query, values);

  return result.rows;
};

exports.getTutorialById = async ({ db, tutorialId }) => {
  const result = await db.query(
    `SELECT slug,logo FROM esmatechcamp.tutorials WHERE id=$1`,
    [tutorialId],
  );
  return result.rows[0];
};

exports.fetchFullTutorialById = async ({ db, id, lang }) => {
  const result = await db.query(
    `SELECT
      t.id AS tutorial_id,
      t.slug AS tutorial_slug,
      tt.title AS tutorial_title,
      tt.description AS tutorial_description,

      m.id AS module_id,
      m.slug AS module_slug,
      m.order_index AS module_order,
      mt.title AS module_title,

      l.id AS lesson_id,
      l.slug AS lesson_slug,
      l.video_url,
      l.order_index AS lesson_order,
      lt.title AS lesson_title,
      lt.content,
      lt.practice,
      lt.quiz

    FROM esmatechcamp.tutorials t
    JOIN esmatechcamp.tutorials_translation tt 
      ON t.id = tt.tutorial_id

    LEFT JOIN esmatechcamp.modules m 
      ON t.id = m.tutorial_id AND m.is_deleted = false

    LEFT JOIN esmatechcamp.modules_translation mt 
      ON m.id = mt.module_id AND mt.lang_code = $2

    LEFT JOIN esmatechcamp.lessons l 
      ON m.id = l.module_id AND l.is_deleted = false

    LEFT JOIN esmatechcamp.lessons_translation lt 
      ON l.id = lt.lesson_id AND lt.lang_code = $2

    WHERE t.id = $1
      AND tt.lang_code = $2
      AND t.is_deleted = false

    ORDER BY m.order_index ASC, l.order_index ASC`,
    [id, lang],
  );

  return result.rows;
};

exports.getTutorialTranslation = async ({ db, id, lang }) => {
  const result = db.query(
    `SELECT id FROM esmatechcamp.tutorials_translation WHERE id=$1 and lang=$2`,
    [id, lang],
  );
  return result.rowCount > 0;
};

exports.updateTutorialById = async ({ db, slug, logo, id }) => {
  const result = await db.query(
    `UPDATE esmatechcamp.tutorials SET slug=$1,logo=$2 WHERE id=$3`,
    [slug, logo, id],
  );
  return result.rows[0];
};

exports.updateTutorialTranslation = async ({
  db,
  tutorialId,
  lang,
  title,
  description,
}) => {
  const result = await db.query(
    `UPDATE esmatechcamp.tutorials_translation
     SET title = $1,
         description = $2,
         updated_at = NOW()
     WHERE tutorial_id = $3 AND lang_code = $4
     RETURNING *`,
    [title, description, tutorialId, lang],
  );

  return result.rows[0];
};

exports.softDeleteTutorial = async ({ db, tutorialId }) => {
  const result = await db.query(
    `UPDATE esmatechcamp.tutorials
     SET is_deleted = true
     WHERE id = $1
     RETURNING *`,
    [tutorialId],
  );

  return rows[0] || null;
};
