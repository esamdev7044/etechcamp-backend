const express = require("express");
const passport = require("passport");
const {
  registerUser,
  loginUser,
  refreshToken,
  createProfile,
  updateProfile,
} = require("./auth.controller");
const { authMiddleware } = require("../middleware/authMiddleware");

const validate = require("../middleware/validate");
const {
  registerSchema,
  loginSchema,
  profileSchema,
} = require("../modules/auth/auth.validation");

const {
  globalLimiter,
  authLimiter,
  sensitiveLimiter,
} = require("../common/middlewares/rateLimiter");

const router = express.Router();
router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);
router.post("/refresh", sensitiveLimiter, refreshToken);
router.post(
  "/create-profile",
  authMiddleware,
  globalLimiter,
  validate(profileSchema),
  createProfile,
);
router.put(
  "/update-profile",
  authMiddleware,
  globalLimiter,
  validate(profileSchema),
  updateProfile,
);
