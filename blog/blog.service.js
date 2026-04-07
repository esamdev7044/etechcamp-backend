const slugify = require("slugify");
const pool = require("../../config/db");
const repo = require("./blog.repository");
const { AppError } = require("../../common/middleware/errorHandler");

exports.getBlogs = async ({ lang, page = 1, limit = 10 }) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit)); 

  const offset = (safePage - 1) * safeLimit;

  const { rows, total } = await repo.getBlogs({
    lang,
    limit: safeLimit,
    offset,
  });

  return {
    data: rows,
    meta: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};

exports.getBlogBySlug = async (slug) => {
  const blog = await repo.getBlogBySlug(slug);

  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  return blog;
};

exports.createBlog = async (userId, body, file) => {
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { title, content, category_id, language_code } = body;

  if (!title || !content || !category_id || !language_code) {
    throw new AppError("Missing required fields", 400);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const baseSlug = slugify(title, { lower: true, strict: true }).slice(0, 60);
    const featured_image_id = file?.fileId || null;

    let slug;
    let attempt = 0;
    const MAX_RETRIES = 5;

    while (attempt < MAX_RETRIES) {
      try {
        slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt}`;

        const blog = await repo.createBlog(client, {
          author_id: userId,
          ...body,
          slug,
          featured_image_id,
        });

        await client.query("COMMIT");
        return blog;
      } catch (err) {
        if (err.code === "23505") {
          attempt++;
          continue;
        }
        throw err;
      }
    }

    throw new AppError("Could not generate unique slug", 500);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

exports.updateBlog = async (id, body, file) => {
  if (!id) {
    throw new AppError("Blog ID is required", 400);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const fields = [];
    const values = [];
    let i = 1;

    const allowed = [
      "title",
      "subtitle",
      "description",
      "content",
      "category_id",
      "is_featured",
      "is_published",
    ];

    for (const key of allowed) {
      if (body[key] !== undefined) {
        fields.push(`${key} = $${i++}`);
        values.push(body[key]);
      }
    }

    // ✅ Slug regeneration with collision handling
    if (body.title) {
      const baseSlug = slugify(body.title, {
        lower: true,
        strict: true,
        trim: true,
      }).slice(0, 60);

      let slug;
      let attempt = 0;
      const MAX_RETRIES = 5;

      while (attempt < MAX_RETRIES) {
        slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt}`;

        try {
          fields.push(`slug = $${i++}`);
          values.push(slug);
          break;
        } catch {
          attempt++;
        }
      }
    }

    if (file?.fileId) {
      fields.push(`featured_image_id = $${i++}`);
      values.push(file.fileId);
    }

    if (!fields.length) {
      throw new AppError("No data to update", 400);
    }

    const updated = await repo.updateBlog(fields, values, id);

    await client.query("COMMIT");

    if (!updated) {
      throw new AppError("Blog not found", 404);
    }

    return updated;
  } catch (err) {
    await client.query("ROLLBACK");

    if (err.code === "23505") {
      throw new AppError("Slug already exists", 400);
    }

    throw err;
  } finally {
    client.release();
  }
};
// ================= DELETE =================

exports.deleteBlog = async (id) => {
  const deleted = await repo.deleteBlog(id);

  if (!deleted) {
    throw new AppError("Blog not found", 404);
  }
};
