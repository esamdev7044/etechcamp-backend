exports.getBlogs = async (pool, filters) => {
  let { lang, featured, limit = 10, offset = 0 } = filters;
  limit = Math.min(Number(limit) || 10, 100);
  offset = Number(offset) || 0;

  const values = [];
  const conditions = ["b.is_deleted = false", "b.is_published = true"];

  if (lang) {
    values.push(lang);
    conditions.push(`b.language_code = $${values.length}`);
  }

  if (featured !== undefined) {
    values.push(featured);
    conditions.push(`b.is_featured = $${values.length}`);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const query = `
    SELECT b.*, c.name as category
    FROM esmatechcamp.blogs b
    LEFT JOIN esmatechcamp.categories c ON b.category_id = c.id
    ${whereClause}
    ORDER BY b.created_at DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  const result = await pool.query(query, [...values, limit, offset]);
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM esmatechcamp.blogs b
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, values);

  return {
    rows: result.rows,
    total: Number(countResult.rows[0].total),
  };
};

exports.getBlogBySlug = async (pool, slug) => {
  const result = await pool.query(
    `SELECT b.*, c.name as category
     FROM esmatechcamp.blogs b
     LEFT JOIN esmatechcamp.categories c ON b.category_id = c.id
     WHERE b.slug = $1 AND b.is_deleted = false`,
    [slug],
  );

  return result.rows[0];
};

exports.checkSlugExists = async (pool, slug) => {
  const result = await pool.query(
    `SELECT slug FROM esmatechcamp.blogs WHERE slug=$1`,
    [slug],
  );
  return result > 0;
};

exports.selectCategoryIdBySlug = async (client, slug) => {
  const result = await client.query(
    `SELECT id FROM esmatechcamp.categories WHERE slug = $1`,
    [slug],
  );

  return result.rows[0]?.id;
};

exports.createBlog = async (client, data) => {
  const {
    author_id,
    title,
    subtitle,
    description,
    content,
    category_id,
    language_code,
    slug,
    featured_image_id,
    is_featured,
    is_published,
  } = data;

  const result = await client.query(
    `INSERT INTO esmatechcamp.blogs
    (author_id, title, subtitle, description, content,
     category_id, language_code, slug,
     featured_image_id, is_featured, is_published, published_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *`,
    [
      author_id,
      title,
      subtitle,
      description,
      content,
      category_id,
      language_code,
      slug,
      featured_image_id,
      is_featured,
      is_published,
      is_published ? new Date() : null,
    ],
  );

  return result.rows[0];
};

exports.updateBlog = async (client, fields, values, id) => {
  values.push(id);

  const result = await client.query(
    `UPDATE esmatechcamp.blogs
     SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING *`,
    values,
  );

  return result.rows[0];
};

exports.deleteBlog = async (pool, id) => {
  const result = await pool.query(
    `UPDATE esmatechcamp.blogs SET is_deleted = true WHERE id = $1`,
    [id],
  );

  return result.rowCount;
};

exports.searchBlogs = async (pool, { query, lang, limit, offset }) => {
  if (!query) return { data: [], total: 0 };
  const values = [query];
  let langFilter = "";
  let paramIndex = 2;

  if (lang) {
    langFilter = `AND b.language_code = $${paramIndex}`;
    values.push(lang);
    paramIndex++;
  }

  values.push(limit);
  values.push(offset);

  const sql = `
    SELECT 
      b.id, b.title, b.slug, b.subtitle, b.description, b.content,
      b.language_code, b.is_featured, b.created_at, b.updated_at,
      c.name AS category
    FROM esmatechcamp.blogs b
    LEFT JOIN esmatechcamp.categories c ON b.category_id = c.id
    WHERE b.is_deleted = false
      AND b.is_published = true
      AND to_tsvector('english', b.title || ' ' || b.description || ' ' || c.name || ' ' || c.slug) @@ plainto_tsquery('english', $1)
      ${langFilter}
    ORDER BY b.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const countValues = [query];
  let countLangFilter = "";
  if (lang) {
    countLangFilter = "AND b.language_code = $2";
    countValues.push(lang);
  }

  const totalResult = await pool.query(
    `SELECT COUNT(*) FROM esmatechcamp.blogs b
     LEFT JOIN esmatechcamp.categories c ON b.category_id = c.id
     WHERE b.is_deleted = false
       AND b.is_published = true
       AND to_tsvector('english', b.title || ' ' || b.description || ' ' || c.name || ' ' || c.slug) @@ plainto_tsquery('english', $1)
       ${countLangFilter}`,
    countValues,
  );
  const total = parseInt(totalResult.rows[0].count, 10);

  const result = await pool.query(sql, values);

  return {
    data: result.rows,
    total,
  };
};
