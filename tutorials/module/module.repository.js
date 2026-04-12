const TABLE = "esmatechcamp.modules";
const TRANSLATION_TABLE = "esmatechcamp.modules_translation";

exports.checkSlugExists = async ({ db, tutorialId, slug }) => {
  const { rowCount } = await db.query(
    `SELECT 1 FROM ${TABLE}
     WHERE tutorial_id = $1 
       AND slug = $2
       AND is_deleted = false`,
    [tutorialId, slug],
  );

  return rowCount > 0;
};

exports.checkTutorialExists = async ({ db, tutorialId }) => {
  const { rowCount } = await db.query(
    `SELECT 1 FROM esmatechcamp.tutorials
     WHERE id = $1 AND is_deleted = false`,
    [tutorialId],
  );

  return rowCount > 0;
};

exports.createModule = async ({ db, tutorialId, slug }) => {
  const { rows } = await db.query(
    `INSERT INTO ${TABLE} (tutorial_id, slug, order_index)
     VALUES (
       $1, 
       $2, 
       COALESCE(
         (SELECT MAX(order_index) + 1 FROM ${TABLE} WHERE tutorial_id = $1),
         1
       )
     )
     RETURNING *`,
    [tutorialId, slug],
  );

  return rows[0];
};

exports.checkModuleExists = async ({ db, moduleId }) => {
  const { rowCount } = await db.query(
    `SELECT 1 FROM ${TABLE}
     WHERE id = $1 
       AND is_deleted = false`,
    [moduleId],
  );

  return rowCount > 0;
};

exports.upsertModuleTranslation = async ({
  db,
  moduleId,
  lang_code,
  title,
}) => {
  const { rows } = await db.query(
    `INSERT INTO ${TRANSLATION_TABLE}
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

exports.getModulesWithTranslation = async ({ db, tutorialId, lang }) => {
  const { rows } = await db.query(
    `SELECT
        m.id,
        m.slug,
        m.order_index,
        COALESCE(mt.title, '') AS title,
        mt.lang_code
     FROM ${TABLE} m
     LEFT JOIN ${TRANSLATION_TABLE} mt
       ON m.id = mt.module_id 
       AND mt.lang_code = $2
     WHERE m.tutorial_id = $1
       AND m.is_deleted = false
     ORDER BY m.order_index ASC`,
    [tutorialId, lang],
  );

  return rows;
};

exports.updateModule = async ({ db, id, slug }) => {
  const { rows } = await db.query(
    `UPDATE ${TABLE}
     SET slug = $1,
         updated_at = NOW()
     WHERE id = $2
       AND is_deleted = false
     RETURNING *`,
    [slug, id],
  );

  return rows[0];
};

exports.updateModuleTranslation = async ({ db, moduleId, lang, title }) => {
  const result = await db.query(
    `UPDATE ${TRANSLATION_TABLE}
     SET title = $1,
         updated_at = NOW()
     WHERE module_id = $2
       AND lang_code = $3
     RETURNING *`,
    [title, moduleId, lang],
  );

  return result.rows[0];
};

exports.softDeleteModule = async ({ db, id }) => {
  const { rows } = await db.query(
    `UPDATE ${TABLE}
     SET is_deleted = true,
         updated_at = NOW()
     WHERE id = $1
       AND is_deleted = false
     RETURNING *`,
    [id],
  );

  return rows[0];
};
