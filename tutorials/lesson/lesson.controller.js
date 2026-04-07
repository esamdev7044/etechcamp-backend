const service = require("./lesson.service");
const asyncHandler = require("../../common/utils/asyncHandler");

exports.createLesson = asyncHandler(async (req, res) => {
  const lesson = await service.createLesson(req.params.moduleId, req.body);

  res.status(201).json({
    success: true,
    message: "Lesson created!",
    lesson,
  });
});

exports.createLessonTranslation = asyncHandler(async (req, res) => {
  const translation = await service.createLessonTranslation(
    req.params.id,
    req.body,
  );

  res.status(201).json({
    success: true,
    message: "Lesson translation saved!",
    translation,
  });
});

exports.getLessonsByModule = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const { lang } = req.query;

  const lessons = await service.getLessonsByModule(moduleId, lang);

  res.status(200).json({
    success: true,
    lessons,
  });
});

exports.getLessons = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;

  const lessons = await service.getLessons(moduleId);

  res.status(200).json({
    success: true,
    lessons,
  });
});

exports.updateLesson = asyncHandler(async (req, res) => {
  const lesson = await service.updateLesson(req.params.id, req.body);

  res.status(200).json({
    success: true,
    lesson,
  });
});

exports.updateLessonTranslation = asyncHandler(async (req, res) => {
  const translation = await service.updateLessonTranslation(
    req.params.id,
    req.params.lang,
    req.body,
  );

  res.status(200).json({
    success: true,
    translation,
  });
});

exports.removeLesson = asyncHandler(async (req, res) => {
  await service.removeLesson(req.params.id);

  res.status(200).json({
    success: true,
    message: "Lesson removed successfully",
  });
});
