const mongoose = require("mongoose");
const config = require("./config");
const logger = require("../src/utils/logger");

const connectDB = async () => {
  try {
    mongoose.connection.on("error", (error) => {
      logger.error("Error de conexión con MongoDB", { error: error.message });
    });
    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB desconectado");
    });

    await mongoose.connect(config.MONGO_URI);
    logger.info("Conectado a MongoDB");
    return mongoose.connection;
  } catch (error) {
    logger.error("Error al conectar a MongoDB", { error: error.message });
    throw error;
  }
};

module.exports = connectDB;