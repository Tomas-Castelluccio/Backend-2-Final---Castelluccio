class PasswordResetController {
  constructor(passwordResetService) {
    this.passwordResetService = passwordResetService;
  }

  requestPasswordReset = async (req, res, next) => {
    try {
      const { email } = req.body;
      const result = await this.passwordResetService.requestPasswordReset(email);

      const payload = {
        message:
          "Si el email está registrado, te enviamos un correo con las instrucciones para restablecer la contraseña.",
      };

      if (result && !result.delivered && result.previewUrl) {
        payload.previewUrl = result.previewUrl;
      }

      res.json(payload);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      const { token, password } = req.body;
      await this.passwordResetService.resetPassword(token, password);
      res.json({ message: "Contraseña restablecida correctamente" });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = PasswordResetController;
