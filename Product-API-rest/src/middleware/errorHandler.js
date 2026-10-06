const config = require("../../config/config");
const logger = require("../utils/logger");
const { AppError } = require("../errors/app-error");

const notFoundHandler = (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: "Ruta no encontrada" });
  }

  const styles = `
  body {
    font-family: Arial, sans-serif;
    background-color: #f8f9fa;
    color: #333;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
  }
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
   }
`;
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>404 - Not Found</title>
      <style>
        ${styles}
      </style>
    </head>
    <body>
    <div class="container">
      <h1>404 - Not Found</h1>
      <p>La página que buscas no existe.</p>
      <a href="/" class="btn">Volver al inicio</a>
    </div>
    </body>
    </html>
  `;

  res.status(404).send(html);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  if (statusCode >= 500) {
    logger.error(err.message, {
      method: req.method,
      url: req.originalUrl,
      statusCode,
      ...(config.isProduction ? {} : { stack: err.stack }),
    });
  } else {
    logger.warn(err.message, {
      method: req.method,
      url: req.originalUrl,
      statusCode,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Error interno en el servidor",
  });
};

module.exports = { notFoundHandler, errorHandler };