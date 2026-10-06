const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const app = require("./app");
const config = require("./config/config");
const connectDB = require("./config/db");
const container = require("./src/di/container");
const logger = require("./src/utils/logger");

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", async (socket) => {
  const products = await container.productsService.getAllProducts();
  socket.emit("products", products);

  socket.on("new-product", async (productData) => {
    try {
      await container.productsRepository.create(productData);
      const updatedProducts = await container.productsService.getAllProducts();
      io.emit("products", updatedProducts);
    } catch (error) {
      logger.error("Error al crear producto por socket", { error: error.message });
      socket.emit("error", error.message);
    }
  });

  socket.on("delete-product", async (id) => {
    try {
      await container.productsRepository.delete(id);
      const updatedProducts = await container.productsService.getAllProducts();
      io.emit("products", updatedProducts);
    } catch (error) {
      logger.error("Error al eliminar producto por socket", { error: error.message });
      socket.emit("error", error.message);
    }
  });
});

const startServer = async () => {
  try {
    await connectDB();

    server.listen(config.PORT, () => {
      logger.info(`Servidor escuchando en http://localhost:${config.PORT}`);
      logger.info(`Entorno: ${config.NODE_ENV} · mailing: ${config.MAIL_TRANSPORT}`);
    });
  } catch (error) {
    logger.error("Error al iniciar el servidor", { error: error.message });
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  logger.info(`${signal} recibido, cerrando el servidor...`);

  const forceExit = setTimeout(() => {
    logger.error("Apagado forzado por timeout");
    process.exit(1);
  }, config.SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();

  try {
    io.close();
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
    logger.info("Servidor cerrado correctamente");
    process.exit(0);
  } catch (error) {
    logger.error("Error durante el apagado", { error: error.message });
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  logger.error("Promesa rechazada sin manejar", {
    error: reason instanceof Error ? reason.message : String(reason),
  });
});
process.on("uncaughtException", (error) => {
  logger.error("Excepción no controlada", { error: error.message });
  shutdown("uncaughtException");
});

startServer();