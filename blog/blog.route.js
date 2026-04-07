const express = require("express");

const controller = require("./blog.controller");

const { authenticate } = require("../../common/middleware/authMiddleware");
const { authorize } = require("../../common/middleware/authorize");
const { validate } = require("../../common/middleware/validate");
const { validateParams } = require("../../common/middleware/validateParams");
const { globalLimiter } = require("../../common/middleware/rateLimiter");

const {
  createBlogSchema,
  updateBlogSchema,
  slugParamSchema,
  idParamSchema,
} = require("./blog.validation");

const router = express.Router();

router.use(globalLimiter);
router.get("/", controller.getBlogs);
router.get("/featured", controller.getFeaturedBlogs);
router.get("/search", controller.searchBlogs);
router.get(
  "/slug/:slug",
  validateParams(slugParamSchema),
  controller.getBlogBySlug
);
router.get(
  "/category/:categorySlug",
  controller.getBlogByCategory
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createBlogSchema),
  controller.createBlog
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  validateParams(idParamSchema),
  validate(updateBlogSchema),
  controller.updateBlog
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  validateParams(idParamSchema),
  controller.deleteBlog
);

module.exports = router;