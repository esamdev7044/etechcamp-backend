const asyncHandler = require("../../common/middleware/asyncHandler");
const tutorialService = require("./tutorial.service");

exports.createTutorial = asyncHandler(async (req, res) => {
  const tutorial = await tutorialService.createTutorial(req.body, req.file);

  res.status(201).json({
    success: true,
    message: "Tutorial created successfully",
    data: tutorial,
  });
});

exports.createOrUpdateTranslation = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const { lang_code, title, description } = req.body;

  const translation = await tutorialService.createOrUpdateTranslation({
    tutorialId: id,
    lang_code,
    title,
    description,
  });

  res.status(201).json({
    success: true,
    message: "Translation saved successfully",
    data: translation,
  });
});

exports.getAllTutorialsByLang = asyncHandler(async (req, res) => {
  getTutorialsByLangSchema.parse(req);

  const { lang } = req.params;

  const tutorials = await tutorialService.getAllTutorialsByLang(lang);

  res.status(200).json({
    success: true,
    count: tutorials.length,
    data: tutorials,
  });
});

exports.getTutorialById = asyncHandler(async (req, res) => {
  const { id, lang } = req.params;
  const tutorial = await tutorialService.getTutorialById(id, lang);

  res.status(200).json({
    success: true,
    data: tutorial,
  });
});

exports.updateTutorial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tutorial = await tutorialService.updateTutorial(id, req.body, req.file);

  res.status(200).json({
    success: true,
    data: tutorial,
  });
});

const asyncHandler = require("../../common/middleware/asyncHandler");
const service = require("./tutorialTranslation.service");
const { updateTranslationSchema, removeTutorialSchema } = require("./tutorialTranslation.validation");

exports.updateTranslation = asyncHandler(async (req, res) => {
  const { id, lang } = req.params;
  const updatedTranslation = await service.updateTranslation(id, lang, req.body);

  res.status(200).json({
    success: true,
    data: updatedTranslation,
  });
});

exports.removeTutorial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await service.removeTutorial(id);

  res.status(200).json({
    success: true,
    message: "Deleted successfully",
  });
});

exports.getFullTutorialById = asyncHandler(async (req, res) => {
  const { id, lang } = req.params;
  const tutorial = await tutorialService.getFullTutorialById(id, lang);

  res.status(200).json({
    success: true,
    data: tutorial,
  });
});