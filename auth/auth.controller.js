const asyncHandler = require("../common/middlewares/asyncHandler");
const authService = require("./auth.service");

exports.registerUser = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
});

exports.loginUser = asyncHandler(async (req, res) => {
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

exports.deleteUser = asyncHandler(async (req, res) => {
  await authService.deleteUser(req.user.id);

  res.clearCookie("refreshToken");

  res.json({
    success: true,
    message: "User deleted",
  });
});