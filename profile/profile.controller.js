const asyncHandler = require("../common/middlewares/asyncHandler");
const service = require("./profile.service");

exports.createProfile = asyncHandler(async (req, res) => {
  const profile = await service.createProfile(
    req.user.id,
    req.validated.body,
    req.file,
  );

  res.status(201).json({
    success: true,
    data: profile,
  });
});

exports.getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await service.getPublicProfile(req.params.userId);

  res.json({
    success: true,
    data: profile,
  });
});

exports.getMyProfile = asyncHandler(async (req, res) => {
  const profile = await service.getProfile(req.user.id);

  res.json({
    success: true,
    data: profile,
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await service.updateProfile(
    req.user.id,
    req.validated.body,
    req.file,
  );

  res.json({
    success: true,
    data: profile,
  });
});

exports.deleteProfile = asyncHandler(async (req, res) => {
  await service.deleteProfile(req.user.id);

  res.json({
    success: true,
    message: "Profile deleted",
  });
});
