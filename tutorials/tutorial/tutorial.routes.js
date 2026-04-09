const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../../common/middlewares/auth.middleware");
const {
  globalLimiter,
  sensitiveLimiter,
} = require("../../common/middlewares/rateLimiter");
const { validate } = require("../../common/middlewares/validator");

const tutorialsController = require("./tutorial.controller");
const tutorialValidation = require("./tutorial.validation");

router.use(globalLimiter);

router.get(
  "/",
  validate(tutorialValidation.getTutorialsSchema),
  tutorialsController.getAllTutorialsByLang,
);

router.get(
  "/:id",
  authMiddleware,
  validate(tutorialValidation.getTutorialByIdSchema),
  tutorialsController.getTutorialById,
);

router.get(
  "/:id/full",
  authMiddleware,
  validate(tutorialValidation.getTutorialByIdSchema),
  tutorialsController.getFullTutorialById,
);

router.post(
  "/",
  authMiddleware,
  sensitiveLimiter,
  validate(tutorialValidation.createTutorialSchema),
  tutorialsController.createTutorial,
);

router.patch(
  "/:id",
  authMiddleware,
  sensitiveLimiter,
  validate(tutorialValidation.updateTutorialSchema),
  tutorialsController.updateTutorial,
);

router.delete(
  "/:id",
  authMiddleware,
  sensitiveLimiter,
  validate(tutorialValidation.removeTutorialSchema),
  tutorialsController.removeTutorial,
);

router.put(
  "/:id/translations/:lang",
  authMiddleware,
  sensitiveLimiter,
  validate(tutorialValidation.translationSchema),
  tutorialsController.createOrUpdateTranslation,
);

router.post(
  "/:id/translations",
  authMiddleware,
  sensitiveLimiter,
  validate(tutorialValidation.createTranslationSchema),
  tutorialsController.createOrUpdateTranslation,
);

module.exports = router;
