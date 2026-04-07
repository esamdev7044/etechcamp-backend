const pool = require("../../config/db");

exports.checkSlugExists = async (tutorialId, slug) => {
  const { rowCount } = await pool.query(
    `SELECT 1 FROM esmatechcamp.modules 
     WHERE tutorial_id = $1 AND slug = $2`,
    [tutorialId, slug],
  );

  return rowCount > 0;
};

exports.createModule = async ({ tutorialId, slug }) => {
  const { rows } = await pool.query(
    `INSERT INTO esmatechcamp.modules (tutorial_id, slug)
     VALUES ($1, $2)
     RETURNING *`,
    [tutorialId, slug],
  );

  return rows[0];
};

exports.checkModuleExists = async (moduleId) => {
  const { rowCount } = await pool.query(
    `SELECT 1 FROM esmatechcamp.modules WHERE id = $1 AND is_deleted = false`,
    [moduleId],
  );

  return rowCount > 0;
};

exports.upsertModuleTranslation = async ({ moduleId, lang_code, title }) => {
  const { rows } = await pool.query(
    `INSERT INTO esmatechcamp.modules_translation 
     (module_id, lang_code, title)
     VALUES ($1, $2, $3)
     ON CONFLICT (module_id, lang_code)
     DO UPDATE SET 
       title = EXCLUDED.title,
       updated_at = NOW()
     RETURNING *`,
    [moduleId, lang_code, title],
  );

  return rows[0];
};

exports.getModulesWithTranslation = async (tutorialId, lang) => {
  const { rows } = await pool.query(
    `SELECT
        m.id AS module_id,
        m.slug AS module_slug,
        m.order_index,
        COALESCE(mt.title, '') AS module_title,
        mt.lang_code AS module_lang_code
     FROM esmatechcamp.modules m
     LEFT JOIN esmatechcamp.modules_translation mt
       ON m.id = mt.module_id AND mt.lang_code = $2
     WHERE m.tutorial_id = $1
       AND m.is_deleted = false
     ORDER BY m.order_index ASC`,
    [tutorialId, lang],
  );

  return rows;
};

exports.updateModule = async (id, updates) => {
  const fields = [];
  const values = [];
  let i = 1;

  for (const key in updates) {
    fields.push(`${key} = $${i++}`);
    values.push(updates[key]);
  }

  values.push(id);

  const { rows } = await pool.query(
    `UPDATE esmatechcamp.modules
     SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${i}
       AND is_deleted = false
     RETURNING *`,
    values,
  );

  return rows[0] || null;
};

exports.updateModuleTranslation = async ({ moduleId, lang, title }) => {
  const { rows } = await pool.query(
    `UPDATE esmatechcamp.modules_translation
     SET title = $1,
         updated_at = NOW()
     WHERE module_id = $2
       AND lang_code = $3
     RETURNING *`,
    [title, moduleId, lang],
  );

  return rows[0] || null;
};

exports.softDeleteModule = async (id) => {
  const { rowCount } = await pool.query(
    `UPDATE esmatechcamp.modules
     SET is_deleted = true,
         updated_at = NOW()
     WHERE id = $1
       AND is_deleted = false`,
    [id],
  );

  return rowCount > 0;
};
