const express = require("express");
const path = require("path");
const helmet = require("helmet");
const { engine } = require("express-handlebars");
const app = express();
const productsRoutes = require("./src/routes/products.routes");
const cartsRoutes = require("./src/routes/carts.routes");
const usersRoutes = require("./src/routes/users.routes");
const sessionsRoutes = require("./src/routes/sessions.routes");
const ordersRoutes = require("./src/routes/orders.routes");
const container = require("./src/di/container");
const HealthController = require("./src/controllers/health.controller");
const { passport } = require("./config/passport");
const config = require("./config/config");
const { notFoundHandler, errorHandler } = require("./src/middleware/errorHandler");

const healthController = new HealthController();

app.engine("hbs", engine({
  extname: ".hbs",
  defaultLayout: "main",
  layoutsDir: path.join(__dirname, "src/views/layouts"),
  partialsDir: path.join(__dirname, "src/views/partials"),
}));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src/views/pages"));
app.set("trust proxy", config.TRUST_PROXY ? 1 : false);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use("/static", express.static(path.join(__dirname, "public")));
app.use("/static/img", express.static(path.join(__dirname, "..", "img")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/api/health", healthController.check);
app.get("/health", healthController.check);

app.use("/api/products", productsRoutes);
app.use("/api/carts", cartsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/orders", ordersRoutes);

app.get("/", async (req, res, next) => {
  try {
    const products = await container.productsService.getAllProducts();
    res.render("home", { products });
  } catch (error) {
    next(error);
  }
});

app.get("/realtimeproducts", async (req, res, next) => {
  try {
    const products = await container.productsService.getAllProducts();
    res.render("realTimeProducts", { products });
  } catch (error) {
    next(error);
  }
});

app.get("/reset-password", (req, res) => {
  res.render("resetPassword", { token: req.query.token || "" });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;