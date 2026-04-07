const asyncHandler = require("../common/middlewares/asyncHandler");
const authService = require("./auth.service");

exports.register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await authService.loginUser(
    req,
    req.body
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.json({
    success: true,
    accessToken,
  });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  const accessToken = await authService.refreshToken(token);

  res.json({
    success: true,
    accessToken,
  });
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies.refreshToken);

  res.clearCookie("refreshToken");

  res.json({
    success: true,
    message: "Logged out",
  });
});

exports.createProfile = asyncHandler(async (req, res) => {
  const profile = await authService.createProfile(
    req.user.id,
    req.validated.body,
    req.file
  );

  res.status(201).json({
    success: true,
    data: profile,
  });
});

exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.id);

  res.json({
    success: true,
    data: profile,
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await authService.updateProfile(
    req.user.id,
    req.validated.body,
    req.file
  );

  res.json({
    success: true,
    data: profile,
  });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  await authService.deleteUser(req.user.id);

  res.clearCookie("refreshToken");

  res.json({
    success: true,
    message: "User deleted",
  });
});