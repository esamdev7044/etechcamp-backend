const express = require("express");
const router = express.Router();

const { authenticate } = require("../../common/middlewares/authenticate");
const {
  globalLimiter,
  sensitiveLimiter,
} = require("../../common/middlewares/rateLimiter");
const {
  validate,
  validateParams,
  validateQuery,
} = require("../../common/middlewares/validator");
const { authorize } = require("../../common/middlewares/authorize");

const tutorialsController = require("./tutorial.controller");
const tutorialValidation = require("./tutorial.validation");

router.use(globalLimiter);

router.post(
  "/",
  authenticate,
  sensitiveLimiter,
  authorize("admin"),
  validate(tutorialValidation.createTutorialSchema),
  tutorialsController.createTutorial,
);

router.post(
  "/:id/translations",
  authenticate,
  sensitiveLimiter,
  authorize("admin"),
  validateParams(tutorialValidation.idParamSchema),
  validate(tutorialValidation.createTranslationSchema),
  tutorialsController.createTutorialTranslation,
);

router.get(
  "/",
  validateQuery(tutorialValidation.langQuerySchema),
  tutorialsController.getAllTutorialsByLang,
);

router.get(
  "/:id",
  validateParams(tutorialValidation.idParamSchema),
  validateQuery(tutorialValidation.langQuerySchema),
  tutorialsController.getFullTutorialById,
);

router.patch(
  "/:id",
  authenticate,
  sensitiveLimiter,
  authorize("admin"),
  validate(tutorialValidation.updateTutorialSchema),
  validateParams(tutorialValidation.idParamSchema),
  tutorialsController.updateTutorial,
);

router.patch(
  "/:id/translations",
  authenticate,
  sensitiveLimiter,
  authorize("admin"),
  validate(tutorialValidation.translationSchema),
  tutorialsController.updateTutorialTranslation,
);

router.delete(
  "/:id",
  authenticate,
  sensitiveLimiter,
  authorize("admin"),
  validate(tutorialValidation.removeTutorialSchema),
  validateParams(tutorialValidation.idParamSchema),
  tutorialsController.removeTutorial,
);

module.exports = router;
