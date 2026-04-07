const pool = require("../../config/db");

exports.findBySlug = async (client, slug) => {
  const res = await client.query(
    "SELECT 1 FROM esmatechcamp.tutorials WHERE slug = $1",
    [slug],
  );
  return res.rowCount > 0;
};

exports.create = async (client, { slug, logo }) => {
  const res = await client.query(
    `INSERT INTO esmatechcamp.tutorials (slug, logo)
     VALUES ($1, $2)
     RETURNING *`,
    [slug, logo],
  );
  return res.rows[0];
};

exports.upsertTranslation = async (
  tutorial_id,
  lang_code,
  title,
  description,
  client,
) => {
  const res = await client.query(
    `INSERT INTO esmatechcamp.tutorials_translation
     (tutorial_id, lang_code, title, description)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (tutorial_id, lang_code)
     DO UPDATE SET 
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       updated_at = NOW()
     RETURNING *`,
    [tutorial_id, lang_code, title, description],
  );
  return res.rows[0];
};

exports.findAllByLanguage = async (lang) => {
  const { rows } = await pool.query(
    `SELECT 
        t.id,
        t.slug,
        t.logo,
        tt.title,
        tt.description
     FROM esmatechcamp.tutorials t
     JOIN esmatechcamp.tutorials_translation tt 
       ON t.id = tt.tutorial_id
     WHERE tt.lang_code = $1
       AND t.is_deleted = false
     ORDER BY t.created_at ASC`,
    [lang],
  );
  return rows;
};

exports.findByIdAndLang = async (id, lang) => {
  const { rows } = await pool.query(
    `SELECT 
        t.id,
        t.slug,
        t.logo,
        tt.title,
        tt.description
     FROM esmatechcamp.tutorials t
     JOIN esmatechcamp.tutorials_translation tt 
       ON t.id = tt.tutorial_id
     WHERE t.id = $1
       AND tt.lang_code = $2
       AND t.is_deleted = false`,
    [id, lang],
  );
  return rows[0] || null;
};

exports.updateTutorialById = async (id, updates) => {
  const fields = [];
  const values = [];
  let i = 1;

  if (updates.slug) {
    fields.push(`slug = $${i++}`);
    values.push(updates.slug);
  }

  if (updates.logo) {
    fields.push(`logo = $${i++}`);
    values.push(updates.logo);
  }

  if (!fields.length) return null;

  values.push(id);

  const { rows } = await pool.query(
    `UPDATE esmatechcamp.tutorials
     SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${i} AND is_deleted = false
     RETURNING *`,
    values,
  );

  return rows[0] || null;
};

exports.updateTranslation = async (tutorialId, lang, updates) => {
  const { title, description } = updates;

  const { rows } = await pool.query(
    `UPDATE esmatechcamp.tutorials_translation
     SET title = $1,
         description = $2,
         updated_at = NOW()
     WHERE tutorial_id = $3 AND lang_code = $4
     RETURNING *`,
    [title, description, tutorialId, lang]
  );

  return rows[0] || null;
};

exports.softDeleteTutorial = async (tutorialId) => {
  const { rows } = await pool.query(
    `UPDATE esmatechcamp.tutorials
     SET is_deleted = true
     WHERE id = $1
     RETURNING *`,
    [tutorialId]
  );

  return rows[0] || null;
};

exports.fetchFullTutorialById = async (id, lang) => {
  const { rows } = await pool.query(
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
    [id, lang]
  );

  return rows;
};