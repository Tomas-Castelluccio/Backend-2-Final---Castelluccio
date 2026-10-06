const express = require("express");
const router = express.Router();
const container = require("../di/container");
const { passportCall } = require("../../config/passport");
const { requireAuth } = require("../middleware/auth.middleware");
const { authLimiter, passwordResetLimiter } = require("../middleware/rateLimit.middleware");

const authController = container.authController;
const passwordResetController = container.passwordResetController;

router.post("/register", authLimiter, passportCall("register"), authController.register);
router.post("/login", authLimiter, passportCall("login"), authController.login);
router.get("/current", requireAuth, authController.current);
router.post("/logout", requireAuth, authController.logout);
router.post("/forgot-password", passwordResetLimiter, passwordResetController.requestPasswordReset);
router.post("/reset-password", passwordResetLimiter, passwordResetController.resetPassword);

module.exports = router;