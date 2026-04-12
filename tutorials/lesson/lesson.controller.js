const lessonService = require("./lesson.service");
const asyncHandler = require("../../common/middlewares/asyncHandler");

exports.createLesson = asyncHandler(async (req, res) => {
  const moduleId = req.params.moduleId;
  const body = req.body;
  const lesson = await lessonService.createLesson({
    moduleId,
    body,
  });

  res.status(201).json({
    success: true,
    message: "Lesson created",
    data: lesson,
  });
});

exports.createLessonTranslation = asyncHandler(async (req, res) => {
  const lessonId = req.params.id;
  const body = req.body;
  const translation = await lessonService.createLessonTranslation({
    lessonId,
    body,
  });

  res.status(201).json({
    success: true,
    message: "Lesson translation saved",
    data: translation,
  });
});

exports.getLessonsByModule = asyncHandler(async (req, res) => {
  const moduleId = req.params.moduleId;
  const lang = req.query.lang;
  const lessons = await lessonService.getLessonsByModule({ moduleId, lang });

  res.status(200).json({
    success: true,
    count: lessons.length,
    data: lessons,
  });
});

exports.getLessons = asyncHandler(async (req, res) => {
  const moduleId = req.params.moduleId;
  const lessons = await lessonService.getLessons({ moduleId });

  res.status(200).json({
    success: true,
    count: lessons.length,
    data: lessons,
  });
});

exports.updateLesson = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const lesson = await lessonService.updateLesson({ id, body });

  res.status(200).json({
    success: true,
    data: lesson,
  });
});

exports.updateLessonTranslation = asyncHandler(async (req, res) => {
  const lessonId = req.params.id;
  const body = req.body;
  const translation = await lessonService.updateLessonTranslation({
    lessonId,
    body,
  });

  res.status(200).json({
    success: true,
    data: translation,
  });
});

exports.removeLesson = asyncHandler(async (req, res) => {
  const lessonId = req.params.id;
  await lessonService.removeLesson(lessonId);

  res.status(200).json({
    success: true,
    message: "Lesson removed successfully",
  });
});
