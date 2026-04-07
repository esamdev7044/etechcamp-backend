const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../../middleware/authMiddleware");
const {
  globalLimiter,
  sensitiveLimiter,
} = require("../../common/middlewares/rateLimiter");
const { validate } = require("../../common/middlewares/validator");

const tutorialsController = require("./tutorial.controller");
const validation = require("./tutorial.validation");

router.use(globalLimiter);

router.get(
  "/",
  validate(validation.getTutorialsSchema),
  tutorialsController.getAllTutorials,
);

router.get(
  "/:id",
  authMiddleware,
  validate(validation.getTutorialByIdSchema),
  tutorialsController.getTutorialById,
);

router.get(
  "/:id/full",
  authMiddleware,
  validate(validation.getTutorialByIdSchema),
  tutorialsController.getFullTutorialById,
);

router.post(
  "/",
  authMiddleware,
  sensitiveLimiter,
  validate(validation.createTutorialSchema),
  tutorialsController.createTutorial,
);

router.patch(
  "/:id",
  authMiddleware,
  sensitiveLimiter,
  validate(validation.updateTutorialSchema),
  tutorialsController.updateTutorial,
);

router.delete(
  "/:id",
  authMiddleware,
  sensitiveLimiter,
  validate(validation.removeTutorialSchema),
  tutorialsController.remove,
);

router.put(
  "/:id/translations/:lang",
  authMiddleware,
  sensitiveLimiter,
  validate(validation.translationSchema),
  tutorialsController.upsertTutorialTranslation,
);

router.post(
  "/:id/translations",
  authMiddleware,
  sensitiveLimiter,
  validate(validation.createTranslationSchema),
  tutorialsController.createTranslation,
);

module.exports = router;
