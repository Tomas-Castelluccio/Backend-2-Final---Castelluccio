const nodemailer = require("nodemailer");
const config = require("../../config/config");
const logger = require("../utils/logger");
const { AppError } = require("../errors/app-error");

const templates = {
  passwordReset: ({ first_name, resetUrl, expiresMinutes }) => `
    <div style="font-family: Arial, sans-serif; background:#f8f9fa; padding:24px;">
      <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:8px; padding:32px;">
        <h2 style="margin:0 0 16px; color:#333;">Hola ${first_name}</h2>
        <p style="color:#555; line-height:1.5;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        </p>
        <p style="color:#555; line-height:1.5;">
          El enlace es válido por <strong>${expiresMinutes} minutos</strong> y puede usarse una sola vez.
        </p>
        <p style="text-align:center; margin:32px 0;">
          <a href="${resetUrl}"
             style="background:#007bff; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:6px; display:inline-block; font-weight:bold;">
            Restablecer contraseña
          </a>
        </p>
        <p style="color:#888; font-size:12px; line-height:1.5; word-break:break-all;">
          Si el botón no funciona, copiá esta dirección en tu navegador:<br />
          ${resetUrl}
        </p>
        <p style="color:#888; font-size:12px; margin-top:24px;">
          Si no solicitaste el cambio, podés ignorar este mensaje.
        </p>
      </div>
    </div>
  `,
  passwordChanged: ({ first_name }) => `
    <div style="font-family: Arial, sans-serif; background:#f8f9fa; padding:24px;">
      <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:8px; padding:32px;">
        <h2 style="margin:0 0 16px; color:#333;">Hola ${first_name}</h2>
        <p style="color:#555; line-height:1.5;">
          Tu contraseña fue restablecida correctamente. Si no fuiste vos, contactanos de inmediato.
        </p>
      </div>
    </div>
  `,
};

class MailerService {
  constructor() {
    this.transportName = config.MAIL_TRANSPORT;
    this.transporter = this.#createTransporter();
  }

  #createTransporter() {
    switch (this.transportName) {
      case "smtp":
        return nodemailer.createTransport({
          host: config.SMTP_HOST,
          port: config.SMTP_PORT,
          secure: config.SMTP_PORT === 465,
          auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
        });

      case "json":
        return nodemailer.createTransport({ jsonTransport: true });

      case "stream":
        return nodemailer.createTransport({ streamTransport: true, buffer: true });

      case "console":
        return null;

      default:
        throw AppError.badRequest(
          `MAIL_TRANSPORT inválido: "${this.transportName}". Usá smtp, json, stream o console`
        );
    }
  }

  #buildResetUrl(token) {
    return `${config.FRONTEND_URL}/reset-password?token=${token}`;
  }

  async #send(message) {
    if (!this.transporter) return { sent: false, info: null };

    try {
      const info = await this.transporter.sendMail({
        from: config.EMAIL_FROM,
        ...message,
      });
      return { sent: true, info };
    } catch (error) {
      logger.error("Fallo al enviar correo", {
        to: message.to,
        transport: this.transportName,
        error: error.message,
      });
      throw AppError.internal("No se pudo enviar el correo, intentá de nuevo");
    }
  }

  async sendPasswordResetEmail({ email, first_name, token }) {
    const resetUrl = this.#buildResetUrl(token);

    if (!this.transporter) {
      logger.info(
        `[mailer:${this.transportName}] SMTP no configurado. Enlace para ${email}: ${resetUrl}`
      );
      return { delivered: false, previewUrl: resetUrl };
    }

    const { info } = await this.#send({
      to: email,
      subject: "Restablecer contraseña",
      html: templates.passwordReset({
        first_name,
        resetUrl,
        expiresMinutes: config.RESET_TOKEN_EXPIRES_MINUTES,
      }),
    });

    logger.debug("Correo de restablecimiento enviado", { email });

    return {
      delivered: true,
      previewUrl: info?.etherealUrl || null,
    };
  }

  async sendPasswordChangedEmail({ email, first_name }) {
    if (!this.transporter) return;

    await this.#send({
      to: email,
      subject: "Tu contraseña fue actualizada",
      html: templates.passwordChanged({ first_name }),
    });

    logger.debug("Correo de confirmación enviado", { email });
  }
}

module.exports = MailerService;