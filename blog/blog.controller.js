const asyncHandler = require("../common/middlewares/asyncHandler");
const service = require("./blog.service");

exports.getBlogs = asyncHandler(async (req, res) => {
  let { lang, page = 1, limit = 10 } = req.query;

  page = Math.max(1, parseInt(page) || 1);
  limit = Math.min(50, Math.max(1, parseInt(limit) || 10));

  const blogs = await service.getBlogs({
    lang,
    page,
    limit,
  });

  res.json({
    success: true,
    data: blogs.data,
    meta: blogs.meta,
  });
});

exports.searchBlogs = asyncHandler(async (req, res) => {
  const { query, lang, page = 1, limit = 10 } = req.query;

  if (!query) {
    return res.json({
      success: true,
      data: [],
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        totalPages: 0,
      },
    });
  }

  const blogs = await service.searchBlogs({
    query,
    lang,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.json({
    success: true,
    data: blogs.data,
    meta: blogs.meta,
  });
});

exports.getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await service.getBlogBySlug(req.params.slug);

  res.json({
    success: true,
    data: blog,
  });
});

exports.createBlog = asyncHandler(async (req, res) => {
  const blog = await service.createBlog(req.user?.id, req.body, req.file);

  res.status(201).json({
    success: true,
    data: blog,
  });
});

exports.updateBlog = asyncHandler(async (req, res) => {
  const blog = await service.updateBlog(req.params.id, req.body, req.file);

  res.json({
    success: true,
    data: blog,
  });
});

exports.deleteBlog = asyncHandler(async (req, res) => {
  await service.deleteBlog(req.params.id);

  res.json({
    success: true,
    message: "Blog deleted",
  });
});
