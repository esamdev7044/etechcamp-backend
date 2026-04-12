const asyncHandler = require("../../common/middlewares/asyncHandler");
const service = require("./module.service");

exports.createModule = asyncHandler(async (req, res) => {
  const { tutorialId } = req.params;
  const body = req.body;
  const module = await service.createModule({
    tutorialId,
    body,
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

exports.getModulesByTutorial = asyncHandler(async (req, res) => {
  const modules = await service.getModulesByTutorial({
    tutorialId: req.params.tutorialId,
    lang: req.query.lang,
  });

  res.status(200).json({
    success: true,
    count: modules.length,
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
  const  moduleId  = req.params.id;
  const body = req.body;
  const translation = await service.updateModuleTranslation({
    moduleId,
    body,
  });

  res.status(200).json({
    success: true,
    data: translation,
  });
});

exports.removeModule = asyncHandler(async (req, res) => {
  await service.removeModule(req.params.id);
  res.status(200).json({
    success: true,
    message: "Module removed successfully",
  });
});
