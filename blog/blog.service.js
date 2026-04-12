const slugify = require("slugify");
const pool = require("../config/db");
const repo = require("./blog.repository");
const { AppError } = require("../common/middlewares/errorHandler");
const { generateUniqueSlug } = require("../common/utils/generateUniqueSlug");

exports.getBlogs = async ({ lang, isFeatured, page = 1, limit = 10 }) => {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const offset = (safePage - 1) * safeLimit;

  const { rows, total } = await repo.getBlogs(pool, {
    lang,
    featured: isFeatured,
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
  const blog = await repo.getBlogBySlug(pool, slug);

  if (!blog) {
    throw new AppError("Blog not found", 404);
  }

  return blog;
};

exports.createBlog = async (userId, body, file) => {
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { title, content, category_slug, language_code } = body;

  if (!title || !content || !category_slug || !language_code) {
    throw new AppError("Missing required fields", 400);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const baseSlug = slugify(title, { lower: true, strict: true }).slice(0, 60);
    const categorySlug = slugify(category_slug, { lower: true, strict: true });
    const featured_image_id = file?.fileId || null;

    const categoryId = await repo.selectCategoryIdBySlug(client, categorySlug);

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
          category_id: categoryId,
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
    if (body.title) {
      const baseSlug = slugify(body.title, {
        lower: true,
        strict: true,
        trim: true,
      }).slice(0, 60);

      const finalSlug = await generateUniqueSlug({
        base: baseSlug,
        checkExists: async (slug) => {
          await repo.checkSlugExists(pool, slug);
        },
      });
      fields.push(`slug = $${i++}`);
      values.push(finalSlug);
    }
    if (file?.fileId) {
      fields.push(`featured_image_id = $${i++}`);
      values.push(file.fileId);
    }
    if (!fields.length) {
      throw new AppError("No data to update", 400);
    }
    const updated = await repo.updateBlog(client, fields, values, id);
    if (!updated) {
      throw new AppError("Blog not found", 404);
    }
    await client.query("COMMIT");
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

exports.deleteBlog = async (id) => {
  const deleted = await repo.deleteBlog(pool, id);
  if (!deleted) {
    throw new AppError("Blog not found", 404);
  }
};

exports.searchBlogs = async ({ query, lang, page = 1, limit = 10 }) => {
  if (!query) {
    return { data: [], meta: { page, limit, total: 0, totalPages: 0 } };
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(50, Math.max(1, limit));
  const offset = (safePage - 1) * safeLimit;

  const { data, total } = await repo.searchBlogs(pool, {
    query: query.trim(),
    lang: lang ? lang.trim() : null,
    limit: safeLimit,
    offset: offset,
  });

  return {
    data: data,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};
