const express = require("express");

const blogController = require("./blog.controller");

const { authenticate } = require("../common/middlewares/authenticate");
const { authorize } = require("../common/middlewares/authorize");
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

router.post(
  "/",
  authenticate,
  authorize("admin"),
  sensitiveLimiter,
  validate(blogValidation.createBlogSchema),
  blogController.createBlog,
);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  sensitiveLimiter,
  validateParams(blogValidation.idParamSchema),
  validate(blogValidation.updateBlogSchema),
  blogController.updateBlog,
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  sensitiveLimiter,
  validateParams(blogValidation.idParamSchema),
  blogController.deleteBlog,
);

module.exports = router;
