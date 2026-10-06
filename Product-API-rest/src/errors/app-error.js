class AppError extends Error {
  constructor(message, statusCode = 500, code = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, code) {
    return new AppError(message, 400, code);
  }

  static unauthorized(message = "No autenticado", code) {
    return new AppError(message, 401, code);
  }

  static forbidden(message = "Acceso denegado", code) {
    return new AppError(message, 403, code);
  }

  static notFound(message = "Recurso no encontrado", code) {
    return new AppError(message, 404, code);
  }

  static conflict(message, code) {
    return new AppError(message, 409, code);
  }

  static tooManyRequests(message, code) {
    return new AppError(message, 429, code);
  }

  static internal(message = "Error interno en el servidor", code) {
    return new AppError(message, 500, code);
  }
}

module.exports = { AppError };