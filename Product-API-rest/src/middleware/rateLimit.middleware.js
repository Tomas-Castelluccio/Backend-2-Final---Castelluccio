const rateLimit = require("express-rate-limit");
const config = require("../../config/config");
const { AppError } = require("../errors/app-error");

const build = ({ max, windowMs, message }) => {
  if (!max || max <= 0) {
    return (req, res, next) => next();
  }

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(AppError.tooManyRequests(message));
    },
  });
};

const authLimiter = build({
  max: config.AUTH_RATE_LIMIT_MAX,
  windowMs: config.AUTH_RATE_LIMIT_WINDOW_MS,
  message: "Demasiados intentos de autenticación, intentá de nuevo más tarde",
});

const passwordResetLimiter = build({
  max: config.PASSWORD_RESET_RATE_LIMIT_MAX,
  windowMs: config.PASSWORD_RESET_RATE_LIMIT_WINDOW_MS,
  message: "Demasiadas solicitudes de restablecimiento, intentá de nuevo más tarde",
});

module.exports = { authLimiter, passwordResetLimiter };