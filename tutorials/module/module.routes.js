const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../../common/middlewares/auth.middleware");

const { validate, validateParams } = require("../../common/middlewares/validator");
const {
  globalLimiter,
  sensitiveLimiter,
} = require("../../common/middlewares/rateLimiter");

const moduleController = require("./module.controller");
const validation = require("./module.validation");

router.use(globalLimiter);

router.post(
  "/:tutorialId/modules",
  authMiddleware,
  sensitiveLimiter,
  validate(validation.createModuleSchema),
  moduleController.createModule,
);

router.post(
  "/modules/:id/translation",
  authMiddleware,
  sensitiveLimiter,
  validate(validation.moduleTranslationSchema),
  moduleController.createModuleTranslation,
);

router.get(
  "/tutorials/:tutorialId/modules",
  validate(validation.getModulesSchema),
  moduleController.getModulesByTutorial,
);

router.get(
  "/tutorials/:tutorialId/modules/:lang",
  validate(validation.getModulesByTutorialSchema),
  moduleController.getModulesByTutorial,
);

router.put(
  "/modules/:id",
  authMiddleware,
  validate(validation.updateModuleSchema),
  moduleController.updateModule,
);

router.put(
  "/modules/:id/translation/:lang",
  authMiddleware,
  sensitiveLimiter,
  validate(validation.updateModuleTranslationSchema),
  moduleController.updateModuleTranslation,
);

router.delete(
  "/modules/:id",
  authMiddleware,
  sensitiveLimiter,
  validate(validation.deleteModuleSchema),
  moduleController.remove,
);

module.exports = router;