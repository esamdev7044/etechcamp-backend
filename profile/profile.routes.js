const express = require("express");
const router = express.Router();

const controller = require("./profile.controller");

const { validate, validateParams } = require("../common/middlewares/validator");
const { authenticate } = require("../common/middlewares/authenticate");

const schema = require("./profile.validation");

router.post(
  "/",
  authenticate,
  validate(schema.profileSchema),
  controller.createProfile,
);

router.get("/me", authenticate, controller.getMyProfile);

router.get(
  "/:userId",
  validateParams(schema.validateUserId),
  controller.getPublicProfile,
);

router.put(
  "/me",
  authenticate,
  validate(schema.profileSchema),
  controller.updateProfile,
);

router.delete("/me", authenticate, controller.deleteProfile);

module.exports = router;
