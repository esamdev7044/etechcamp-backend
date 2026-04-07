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
    req.params = schema.parse(req.params);
    next();
  } catch (err) {
    next(new AppError("Invalid parameters", 400));
  }
};

module.exports = { validate, validateParams };
