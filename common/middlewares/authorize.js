const { AppError } = require("./errorHandler");

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    if (
      !roles.map((r) => r.toLowerCase()).includes(req.user.role?.toLowerCase())
    ) {
      return next(new AppError("Forbidden", 403));
    }

    next();
  };
};
