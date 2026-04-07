const asyncHandler = require("../../common/middleware/asyncHandler");
const service = require("./module.service");

exports.createModule = asyncHandler(async (req, res) => {
  const module = await service.createModule({
    tutorialId: req.params.tutorialId,
    body: req.validated.body,
  });

  res.status(201).json({
    success: true,
    data: module,
  });
});

exports.createModuleTranslation = asyncHandler(async (req, res) => {
  const translation = await service.createModuleTranslation({
    moduleId: req.params.id,
    body: req.validated.body,
  });

  res.status(201).json({
    success: true,
    data: translation,
  });
});

exports.getModules = asyncHandler(async (req, res) => {
  const modules = await service.getModules({
    tutorialId: req.params.tutorialId,
  });

  res.status(200).json({
    success: true,
    data: modules,
  });
});

exports.getModulesByTutorial = asyncHandler(async (req, res) => {
  const modules = await service.getModulesByTutorial({
    tutorialId: req.params.tutorialId,
    lang: req.params.lang,
  });

  res.status(200).json({
    success: true,
    data: modules,
  });
});

exports.updateModule = asyncHandler(async (req, res) => {
  const module = await service.updateModule({
    id: req.params.id,
    body: req.validated.body,
  });

  res.status(200).json({
    success: true,
    data: module,
  });
});

exports.updateModuleTranslation = asyncHandler(async (req, res) => {
  const translation = await service.updateModuleTranslation({
    moduleId: req.params.id,
    lang: req.params.lang,
    body: req.validated.body,
  });

  res.status(200).json({
    success: true,
    data: translation,
  });
});

exports.remove = asyncHandler(async (req, res) => {
  await service.removeModule(req.params.id);

  res.status(200).json({
    success: true,
    message: "Module removed successfully",
  });
});