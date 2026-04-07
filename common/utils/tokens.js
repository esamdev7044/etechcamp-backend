require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
  });
}

exports.generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });
}
