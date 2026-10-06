const path = require("path");
require("dotenv").config();

class ConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigurationError";
  }
}

const readString = (name, fallback) => {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") {
    if (fallback === undefined) {
      throw new ConfigurationError(`Falta la variable de entorno ${name}`);
    }
    return fallback;
  }
  return raw.trim();
};

const readNumber = (name, fallback) => {
  const raw = readString(name, undefined);
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (Number.isNaN(value)) {
    throw new ConfigurationError(`${name} debe ser un número, recibí "${raw}"`);
  }
  return value;
};

const readBoolean = (name, fallback) => {
  const raw = readString(name, undefined);
  if (raw === undefined) return fallback;
  return ["1", "true", "yes"].includes(raw.toLowerCase());
};

const NODE_ENV = readString("NODE_ENV", "development");
const isProduction = NODE_ENV === "production";

if (isProduction) {
  const missing = ["MONGO_URI", "JWT_SECRET", "FRONTEND_URL"].filter(
    (name) => !process.env[name] || process.env[name].trim() === ""
  );
  if (missing.length > 0) {
    throw new ConfigurationError(
      `Faltan variables de entorno obligatorias en producción: ${missing.join(", ")}`
    );
  }
}

const JWT_SECRET = readString("JWT_SECRET");
if (JWT_SECRET.length < 16) {
  throw new ConfigurationError(
    "JWT_SECRET es demasiado corto (mínimo 16 caracteres). Generá uno con: openssl rand -hex 32"
  );
}

const SMTP_HOST = readString("SMTP_HOST", "");
const MAIL_TRANSPORT = readString(
  "MAIL_TRANSPORT",
  SMTP_HOST ? "smtp" : "console"
);

const MAIL_TRANSPORTS = ["smtp", "json", "stream", "console"];
if (!MAIL_TRANSPORTS.includes(MAIL_TRANSPORT)) {
  throw new ConfigurationError(
    `MAIL_TRANSPORT inválido: "${MAIL_TRANSPORT}". Valores permitidos: ${MAIL_TRANSPORTS.join(", ")}`
  );
}

if (MAIL_TRANSPORT === "smtp" && !SMTP_HOST) {
  throw new ConfigurationError(
    "MAIL_TRANSPORT=smtp requiere SMTP_HOST. Usá MAIL_TRANSPORT=console para desarrollo."
  );
}

const config = Object.freeze({
  NODE_ENV,
  isProduction,

  PORT: readNumber("PORT", 8080),
  MONGO_URI: readString(
    "MONGO_URI",
    isProduction ? undefined : "mongodb://127.0.0.1:27017/ecommerce"
  ),

  JWT_SECRET,
  JWT_EXPIRES_IN: readString("JWT_EXPIRES_IN", "24h"),

  LOG_LEVEL: readString("LOG_LEVEL", isProduction ? "info" : "debug"),
  TRUST_PROXY: readBoolean("TRUST_PROXY", false),
  SHUTDOWN_TIMEOUT_MS: readNumber("SHUTDOWN_TIMEOUT_MS", 10000),

  AUTH_RATE_LIMIT_MAX: readNumber("AUTH_RATE_LIMIT_MAX", 30),
  AUTH_RATE_LIMIT_WINDOW_MS: readNumber("AUTH_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
  PASSWORD_RESET_RATE_LIMIT_MAX: readNumber("PASSWORD_RESET_RATE_LIMIT_MAX", 10),
  PASSWORD_RESET_RATE_LIMIT_WINDOW_MS: readNumber(
    "PASSWORD_RESET_RATE_LIMIT_WINDOW_MS",
    60 * 60 * 1000
  ),

  MAIL_TRANSPORT,
  SMTP_HOST,
  SMTP_PORT: readNumber("SMTP_PORT", 587),
  SMTP_USER: readString("SMTP_USER", ""),
  SMTP_PASS: readString("SMTP_PASS", ""),
  EMAIL_FROM: readString("EMAIL_FROM", "no-reply@ecommerce.com"),

  FRONTEND_URL: readString("FRONTEND_URL", "http://localhost:8080"),
  RESET_TOKEN_EXPIRES_MINUTES: readNumber("RESET_TOKEN_EXPIRES_MINUTES", 60),

  getFilePath: (filename) => path.join(__dirname, `../data/${filename}`),
});

module.exports = config;