const isProduction = process.env.NODE_ENV === "production";

class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true, details = null) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  if (err.code === "23505") {
    statusCode = 409;
    message = "Duplicate resource";
  }

  if (err.code === "23503") {
    statusCode = 400;
    message = "Invalid reference (foreign key violation)";
  }

  if (err.name === "ZodError") {
    statusCode = 400;
    return res.status(statusCode).json({
      success: false,
      message: "Validation failed",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  if (!isProduction) {
    console.error("ERROR:", err);
  } else {
    console.error("Internal error", {
      message: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    });
  }
  if (isProduction && !err.isOperational) {
    message = "Something went wrong";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...( !isProduction && { stack: err.stack } ),
    ...( err.details && { details: err.details } ),
  });
};

module.exports = {
  errorHandler,
  AppError,
};