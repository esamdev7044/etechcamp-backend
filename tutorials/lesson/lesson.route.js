const express = require("express");
const router = express.Router();

const lessonController = require("./lesson.controller");
const { authMiddleware } = require("../../common/middlewares/auth.middleware");
const {
  globalLimiter,
  sensitiveLimiter,
} = require("../../common/middlewares/rateLimiter");
const { validate } = require("../../common/middlewares/validate");
const validation = require("./lesson.validation");

router.use(globalLimiter);

router.get(
  "/modules/:moduleId/lessons",
  authMiddleware,
  validate(validation.getLessonsSchema),
  lessonController.getLessons,
);

router.post(
  "/modules/:moduleId/lessons",
  authMiddleware,
  sensitiveLimiter,
  validate(validation.createLessonSchema),
  lessonController.createLesson,
);

router.patch(
  "/lessons/:id",
  authMiddleware,
  sensitiveLimiter,
  validate(validation.updateLessonSchema),
  lessonController.updateLesson,
);

router.delete(
  "/lessons/:id",
  authMiddleware,
  sensitiveLimiter,
  validate(validation.deleteLessonSchema),
  lessonController.removeLesson,
);

router.put(
  "/lessons/:id/translations/:lang",
  authMiddleware,
  sensitiveLimiter,
  validate(validation.lessonTranslationSchema),
  lessonController.updateLessonTranslation,
);

router.post(
  "/lessons/:id/translations",
  authMiddleware,
  sensitiveLimiter,
  validate(validation.lessonTranslationSchema),
  lessonController.createLessonTranslation,
);

module.exports = router;
