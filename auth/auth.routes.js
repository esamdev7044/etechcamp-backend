const express = require("express");

const authController = require("./auth.controller");

const { validate } = require("../common/middlewares/validator");

const validation = require("./auth.validation");

const {
  globalLimiter,
  authLimiter,
  sensitiveLimiter,
} = require("../common/middlewares/rateLimiter");

const router = express.Router();
router.use(globalLimiter);

router.post(
  "/register",
  authLimiter,
  validate(validation.registerSchema),
  authController.registerUser,
);

router.post(
  "/login",
  authLimiter,
  validate(validation.loginSchema),
  authController.loginUser,
);

router.post("/refresh-token", sensitiveLimiter, authController.refreshToken);

module.exports = router;
