const express = require("express");
const router = express.Router();

const { authenticate } = require("../../common/middlewares/authenticate");

const {
  validate,
  validateParams,
  validateQuery,
} = require("../../common/middlewares/validator");
const {
  globalLimiter,
  sensitiveLimiter,
} = require("../../common/middlewares/rateLimiter");

const moduleController = require("./module.controller");
const moduleValidation = require("./module.validation");
const { authorize } = require("../../common/middlewares/authorize");

router.use(globalLimiter);

router.post(
  "/tutorials/:tutorialId/modules",
  authenticate,
  sensitiveLimiter,
  authorize("admin"),
  validateParams(moduleValidation.idParamSchema),
  validate(moduleValidation.createModuleSchema),
  moduleController.createModule,
);

router.post(
  "/modules/:id/translations",
  authenticate,
  sensitiveLimiter,
  authorize("admin"),
  validateParams(moduleValidation.idParamSchema),
  validate(moduleValidation.moduleTranslationSchema),
  moduleController.createModuleTranslation,
);

router.get(
  "/tutorials/:tutorialId/modules",
  validateParams(moduleValidation.tutorialIdSchema),
  moduleController.getModulesByTutorial,
);

router.patch(
  "/modules/:id",
  authenticate,
  sensitiveLimiter,
  authorize("admin"),
  validateParams(moduleValidation.idParamSchema),
  validate(moduleValidation.updateModuleSchema),
  moduleController.updateModule,
);

router.patch(
  "/modules/:id/translations/",
  authenticate,
  sensitiveLimiter,
  authorize("admin"),
  validateParams(moduleValidation.idParamSchema),
  validate(moduleValidation.updateModuleTranslationSchema),
  moduleController.updateModuleTranslation,
);

router.delete(
  "/modules/:id",
  authenticate,
  sensitiveLimiter,
  authorize("admin"),
  validateParams(moduleValidation.idParamSchema),
  moduleController.removeModule,
);

module.exports = router;
