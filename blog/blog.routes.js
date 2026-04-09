const express = require("express");

const blogController = require("./blog.controller");

const { authMiddleware } = require("../common/middlewares/auth.middleware");
const { authorize } = require("../common/middlewares/blog.authorize");
const { validate, validateParams } = require("../common/middlewares/validator");

const blogValidation = require("./blog.validation");
const {
  sensitiveLimiter,
  globalLimiter,
} = require("../common/middlewares/rateLimiter");

const router = express.Router();

router.use(globalLimiter);

router.get("/", blogController.getBlogs);

router.get("/search", blogController.searchBlogs);
router.get(
  "/slug/:slug",
  validateParams(blogValidation.slugParamSchema),
  blogController.getBlogBySlug,
);
// router.get("/category/:categorySlug", blogController.get);

router.post(
  "/",
  authMiddleware,
  authorize("admin"),
  sensitiveLimiter,
  validate(blogValidation.createBlogSchema),
  blogController.createBlog,
);
router.put(
  "/:id",
  authMiddleware,
  authorize("admin"),
  sensitiveLimiter,
  validateParams(blogValidation.idParamSchema),
  validate(blogValidation.updateBlogSchema),
  blogController.updateBlog,
);
router.delete(
  "/:id",
  authMiddleware,
  authorize("admin"),
  sensitiveLimiter,
  validateParams(blogValidation.idParamSchema),
  blogController.deleteBlog,
);

module.exports = router;
