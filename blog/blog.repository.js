const pool = require("../../config/db");

exports.getBlogs = async ({ lang, limit, offset }) => {
  const query = `
    SELECT b.*, c.name as category
    FROM esmatechcamp.blogs b
    LEFT JOIN esmatechcamp.categories c ON b.category_id = c.id
    WHERE b.is_deleted = false
    AND b.is_published = true
    ${lang ? "AND b.language_code = $1" : ""}
    ORDER BY b.created_at DESC
    LIMIT $${lang ? 2 : 1}
    OFFSET $${lang ? 3 : 2}
  `;

  const values = lang
    ? [lang, limit, offset]
    : [limit, offset];

  const result = await pool.query(query, values);

  return result.rows;
};

exports.getBlogBySlug = async (slug) => {
  const result = await pool.query(
    `SELECT b.*, c.name as category
     FROM esmatechcamp.blogs b
     LEFT JOIN esmatechcamp.categories c ON b.category_id = c.id
     WHERE b.slug = $1 AND b.is_deleted = false`,
    [slug],
  );

  return result.rows[0];
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
  } = data;

  const result = await client.query(
    `INSERT INTO esmatechcamp.blogs
    (author_id, title, subtitle, description, content,
     category_id, language_code, slug,
     featured_image_id, is_featured, is_published, published_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,NOW())
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
    ],
  );

  return result.rows[0];
};

exports.updateBlog = async (fields, values, id) => {
  values.push(id);

  const result = await pool.query(
    `UPDATE esmatechcamp.blogs
     SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING *`,
    values,
  );

  return result.rows[0];
};

exports.deleteBlog = async (id) => {
  const result = await pool.query(
    `UPDATE esmatechcamp.blogs SET is_deleted = true WHERE id = $1`,
    [id],
  );

  return result.rowCount;
};
