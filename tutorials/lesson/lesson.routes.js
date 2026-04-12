const express = require("express");
const router = express.Router();

const lessonController = require("./lesson.controller");
const { authenticate } = require("../../common/middlewares/authenticate");
const { authorize } = require("../../common/middlewares/authorize");
const {
  globalLimiter,
  sensitiveLimiter,
} = require("../../common/middlewares/rateLimiter");
const {
  validate,
  validateParams,
  validateQuery,
} = require("../../common/middlewares/validator");
const lessonValidator = require("./lesson.validation");

router.use(globalLimiter);

router.post(
  "/modules/:moduleId/lessons",
  authenticate,
  sensitiveLimiter,
  authorize("admin"),
  validate(lessonValidator.createLessonSchema),
  validateParams(lessonValidator.moduleParamSchema),
  lessonController.createLesson,
);

router.post(
  "/lessons/:id/translations",
  authenticate,
  sensitiveLimiter,
  authorize("admin"),
  validate(lessonValidator.lessonTranslationSchema),
  validateParams(lessonValidator.idParamSchema),
  lessonController.createLessonTranslation,
);

router.get(
  "/modules/:moduleId/lessons",
  validateParams(lessonValidator.moduleParamSchema),
  lessonController.getLessons,
);

router.get(
  "/lesson/:id/translations",
  validateParams(lessonValidator.idParamSchema),
  validateQuery(lessonValidator.langQuerySchema),
  lessonController.getLessonsByModule,
);

router.patch(
  "/lessons/:id",
  authenticate,
  sensitiveLimiter,
  authorize("admin"),
  validate(lessonValidator.updateLessonSchema),
  validateParams(lessonValidator.idParamSchema),
  lessonController.updateLesson,
);

router.patch(
  "/lessons/:id/translations",
  authenticate,
  sensitiveLimiter,
  authorize("admin"),
  validate(lessonValidator.lessonTranslationSchema),
  validateParams(lessonValidator.idParamSchema),
  lessonController.updateLessonTranslation,
);

router.delete(
  "/lessons/:id",
  authenticate,
  sensitiveLimiter,
  authorize("admin"),
  validateParams(lessonValidator.idParamSchema),
  lessonController.removeLesson,
);

module.exports = router;
