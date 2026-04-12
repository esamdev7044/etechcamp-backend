const { query } = require("express-validator");
const asyncHandler = require("../../common/middlewares/asyncHandler");
const tutorialService = require("./tutorial.service");

exports.createTutorial = asyncHandler(async (req, res) => {
  const tutorial = await tutorialService.createTutorial(req.body, req.file);
  res.status(201).json({
    success: true,
    message: "Tutorial created successfully",
    data: tutorial,
  });
});

exports.createTutorialTranslation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  const translation = await tutorialService.createTutorialTranslation({
    tutorialId: id,
    body: body,
  });

  res.status(201).json({
    success: true,
    message: "Translation saved successfully",
    data: translation,
  });
});

exports.getAllTutorialsByLang = asyncHandler(async (req, res) => {
  const { lang } = req.query;
  const tutorials = await tutorialService.getAllTutorials(lang);

  res.status(200).json({
    success: true,
    count: tutorials.length,
    data: tutorials,
  });
});

exports.getFullTutorialById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { lang } = req.query;
  const tutorial = await tutorialService.getFullTutorialById(id, lang);

  res.status(200).json({
    success: true,
    data: tutorial,
  });
});

// exports.getTutorialById = asyncHandler(async (req, res) => {
//   const { id, lang } = req.params;
//   const tutorial = await tutorialService.getTutorialById(id, lang);

//   res.status(200).json({
//     success: true,
//     data: tutorial,
//   });
// });

exports.updateTutorial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Tutorial ID is required", 400);
  }

  const tutorial = await tutorialService.updateTutorial(id, req.body, req.file);

  res.status(200).json({
    success: true,
    message: "Tutorial updated successfully",
    data: tutorial,
  });
});

exports.updateTutorialTranslation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !lang) {
    throw new AppError("ID and language are required", 400);
  }

  const updatedTranslation = await service.updateTutorialTranslation(
    id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Translation updated successfully",
    data: updatedTranslation,
  });
});

exports.removeTutorial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Tutorial ID is required", 400);
  }

  await service.removeTutorial(id);

  res.status(200).json({
    success: true,
    message: "Tutorial deleted successfully",
  });
});
