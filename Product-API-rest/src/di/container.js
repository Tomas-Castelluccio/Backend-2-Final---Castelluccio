const UsersRepository = require("../repositories/users.repository");
const CartsRepository = require("../repositories/carts.repository");
const ProductsRepository = require("../repositories/products.repository");
const PasswordResetRepository = require("../repositories/password-reset.repository");
const OrdersRepository = require("../repositories/orders.repository");

const UsersService = require("../services/users.service");
const CartsService = require("../services/carts.service");
const ProductsService = require("../services/products.service");
const AuthService = require("../services/auth.service");
const MailerService = require("../services/mailer.service");
const PasswordResetService = require("../services/password-reset.service");
const OrdersService = require("../services/orders.service");

const UsersController = require("../controllers/users.controller");
const CartsController = require("../controllers/carts.controller");
const ProductsController = require("../controllers/products.controller");
const AuthController = require("../controllers/auth.controller");
const PasswordResetController = require("../controllers/password-reset.controller");
const OrdersController = require("../controllers/orders.controller");

class Container {
  #cache = new Map();

  #resolve(key, factory) {
    if (!this.#cache.has(key)) {
      this.#cache.set(key, factory());
    }
    return this.#cache.get(key);
  }

  get usersRepository() {
    return this.#resolve("usersRepository", () => new UsersRepository());
  }

  get cartsRepository() {
    return this.#resolve("cartsRepository", () => new CartsRepository());
  }

  get productsRepository() {
    return this.#resolve("productsRepository", () => new ProductsRepository());
  }

  get passwordResetRepository() {
    return this.#resolve(
      "passwordResetRepository",
      () => new PasswordResetRepository()
    );
  }

  get ordersRepository() {
    return this.#resolve("ordersRepository", () => new OrdersRepository());
  }

  get mailerService() {
    return this.#resolve("mailerService", () => new MailerService());
  }

  get usersService() {
    return this.#resolve(
      "usersService",
      () => new UsersService(this.usersRepository, this.cartsRepository)
    );
  }

  get cartsService() {
    return this.#resolve(
      "cartsService",
      () =>
        new CartsService(
          this.cartsRepository,
          this.productsRepository,
          this.ordersRepository
        )
    );
  }

  get productsService() {
    return this.#resolve(
      "productsService",
      () => new ProductsService(this.productsRepository)
    );
  }

  get authService() {
    return this.#resolve("authService", () => new AuthService());
  }

  get passwordResetService() {
    return this.#resolve(
      "passwordResetService",
      () =>
        new PasswordResetService(
          this.usersRepository,
          this.passwordResetRepository,
          this.mailerService
        )
    );
  }

  get ordersService() {
    return this.#resolve(
      "ordersService",
      () => new OrdersService(this.ordersRepository)
    );
  }

  get usersController() {
    return this.#resolve(
      "usersController",
      () => new UsersController(this.usersService)
    );
  }

  get cartsController() {
    return this.#resolve(
      "cartsController",
      () => new CartsController(this.cartsService)
    );
  }

  get productsController() {
    return this.#resolve(
      "productsController",
      () => new ProductsController(this.productsService)
    );
  }

  get authController() {
    return this.#resolve(
      "authController",
      () => new AuthController(this.authService)
    );
  }

  get passwordResetController() {
    return this.#resolve(
      "passwordResetController",
      () => new PasswordResetController(this.passwordResetService)
    );
  }

  get ordersController() {
    return this.#resolve(
      "ordersController",
      () => new OrdersController(this.ordersService)
    );
  }
}

module.exports = new Container();