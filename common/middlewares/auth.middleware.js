const jwt = require("jsonwebtoken");
const { AppError } = require("./errorHandler");
const { getUser } = require("../../modules/auth/auth.repository");

const ACCESS_SECRET = process.env.ACCESS_TOKEN;

exports.authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, ACCESS_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new AppError("Token expired", 401);
      }
      throw new AppError("Invalid token", 401);
    }
    const user = await getUser(decoded.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.is_deleted || !user.is_active) {
      throw new AppError("User account is inactive", 403);
    }
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (err) {
    next(err); 
  }
};