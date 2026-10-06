const config = require("../../config/config");
const { generateResetToken, hashToken } = require("../utils/token.util");

class PasswordResetService {
  constructor(usersRepository, passwordResetRepository, mailerService) {
    this.usersRepository = usersRepository;
    this.passwordResetRepository = passwordResetRepository;
    this.mailerService = mailerService;
  }

  async requestPasswordReset(email) {
    if (!email) throw new Error("Email requerido");

    const user = await this.usersRepository.findByEmail(email);
    if (!user) return null;

    const token = generateResetToken();
    const expiresAt = new Date(
      Date.now() + config.RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000
    );

    await this.passwordResetRepository.invalidateActiveByEmail(user.email);

    await this.passwordResetRepository.create({
      email: user.email,
      token: hashToken(token),
      expiresAt,
    });

    return this.mailerService.sendPasswordResetEmail({
      email: user.email,
      first_name: user.first_name,
      token,
    });
  }

  async resetPassword(token, password) {
    if (!token) throw new Error("Token requerido");
    if (!password) throw new Error("Password requerido");
    if (typeof password !== "string" || password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    const record = await this.passwordResetRepository.findActiveByTokenHash(
      hashToken(token)
    );
    if (!record) {
      throw new Error("El enlace de restablecimiento no es válido");
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new Error(
        `El enlace de restablecimiento expiró, es válido por ${config.RESET_TOKEN_EXPIRES_MINUTES} minutos`
      );
    }

    const user = await this.usersRepository.findByEmail(record.email);
    if (!user) throw new Error("Usuario no encontrado");

    const isSamePassword = await this.usersRepository.matchesPassword(
      user.id,
      password
    );
    if (isSamePassword) {
      throw new Error("La nueva contraseña debe ser diferente de la actual");
    }

    await this.usersRepository.update(user.id, { password });
    await this.passwordResetRepository.markAsUsed(record.id);

    await this.mailerService.sendPasswordChangedEmail({
      email: user.email,
      first_name: user.first_name,
    });

    return user.id;
  }
}

module.exports = PasswordResetService;
