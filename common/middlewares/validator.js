const { ZodError } = require("zod");
const { AppError } = require("./errorHandler");

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.validated = validatedData;

      next();
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
  };
};

const validateParams = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse(req.params);
    req.params = validated;
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(new AppError("Param validation error."));
  }
};

const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (err) {
    next(new AppError("Invalid query parameters", 400));
  }
};

module.exports = { validate, validateParams, validateQuery };
