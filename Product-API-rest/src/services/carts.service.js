const { AppError } = require("../errors/app-error");

const round2 = (value) => Math.round(value * 100) / 100;

class CartsService {
  constructor(cartsRepository, productsRepository, ordersRepository) {
    this.cartsRepository = cartsRepository;
    this.productsRepository = productsRepository;
    this.ordersRepository = ordersRepository;
  }

  async getCarts(user) {
    if (user.role === "admin") return this.cartsRepository.findAll();
    return this.cartsRepository.findByOwner(user.id);
  }

  async getAllCarts() {
    return this.cartsRepository.findAll();
  }

  async getCartById(id) {
    if (!id) throw new Error("ID requerido");
    return this.cartsRepository.findById(id);
  }

  async createCart(user) {
    return this.cartsRepository.create(user ? user.id : undefined);
  }

  async addProduct(cid, pid) {
    if (!cid) throw new Error("ID de carrito requerido");
    if (!pid) throw new Error("ID de producto requerido");

    const cart = await this.cartsRepository.findById(cid);
    if (!cart) throw new Error("Carrito no encontrado");

    const product = await this.productsRepository.findById(pid);
    if (!product) throw new Error("Producto no encontrado");

    if (product.status === false) {
      throw new AppError(`El producto "${product.title}" no está disponible`, 409);
    }

    const line = cart.products.find((item) => item.product === pid);
    const requested = line ? line.quantity + 1 : 1;

    if (Number.isFinite(Number(product.stock)) && Number(product.stock) < requested) {
      throw AppError.conflict(
        `Stock insuficiente de "${product.title}": quedan ${product.stock} unidades`
      );
    }

    return this.cartsRepository.addProduct(cid, pid);
  }

  async deleteProduct(cid, pid) {
    if (!cid) throw new Error("ID de carrito requerido");
    if (!pid) throw new Error("ID de producto requerido");

    const cart = await this.cartsRepository.findById(cid);
    if (!cart) throw new Error("Carrito no encontrado");

    return this.cartsRepository.deleteProduct(cid, pid);
  }

  async updateCart(cid, products) {
    if (!cid) throw new Error("ID de carrito requerido");
    if (!Array.isArray(products)) throw new Error("Products debe ser un array");

    const cart = await this.cartsRepository.findById(cid);
    if (!cart) throw new Error("Carrito no encontrado");

    for (const item of products) {
      if (!item.product || typeof item.quantity !== "number") {
        throw new Error("Cada item debe tener product (string) y quantity (number)");
      }
      const product = await this.productsRepository.findById(item.product);
      if (!product) throw new Error(`Producto ${item.product} no encontrado`);
    }

    return this.cartsRepository.updateCart(cid, products);
  }

  async updateProductQuantity(cid, pid, quantity) {
    if (!cid) throw new Error("ID de carrito requerido");
    if (!pid) throw new Error("ID de producto requerido");
    if (typeof quantity !== "number") throw new Error("Quantity debe ser un número");

    const cart = await this.cartsRepository.findById(cid);
    if (!cart) throw new Error("Carrito no encontrado");

    const product = await this.productsRepository.findById(pid);
    if (!product) throw new Error("Producto no encontrado");

    if (quantity > 0) {
      const stock = Number(product.stock);
      if (Number.isFinite(stock) && stock < quantity) {
        throw AppError.conflict(
          `Stock insuficiente de "${product.title}": quedan ${stock} unidades`
        );
      }
    }

    return this.cartsRepository.updateProductQuantity(cid, pid, quantity);
  }

  async clearCart(cid) {
    if (!cid) throw new Error("ID de carrito requerido");

    const cart = await this.cartsRepository.findById(cid);
    if (!cart) throw new Error("Carrito no encontrado");

    return this.cartsRepository.clearCart(cid);
  }

  async deleteCart(id) {
    if (!id) throw new Error("ID requerido");
    const cart = await this.cartsRepository.findById(id);
    if (!cart) throw new Error("Carrito no encontrado");
    return this.cartsRepository.delete(id);
  }

  async purchaseCart(cid, user) {
    const cart = await this.cartsRepository.findById(cid);
    if (!cart) throw AppError.notFound("Carrito no encontrado");

    if (!cart.products || cart.products.length === 0) {
      throw AppError.badRequest("El carrito está vacío, no hay nada para comprar");
    }

    const items = [];
    let total = 0;

    for (const line of cart.products) {
      const product = await this.productsRepository.findById(line.product);
      if (!product) {
        throw AppError.badRequest(
          `El producto ${line.product} ya no existe, quitalo del carrito`
        );
      }

      if (product.status === false) {
        throw AppError.conflict(
          `El producto "${product.title}" no está disponible para la venta`
        );
      }

      const quantity = Number(line.quantity);
      if (!Number.isFinite(quantity) || quantity < 1) {
        throw AppError.badRequest(
          `Cantidad inválida para "${product.title}"`
        );
      }

      const stock = Number(product.stock);
      if (!Number.isFinite(stock)) {
        throw AppError.conflict(
          `El producto "${product.title}" no tiene stock cargado`
        );
      }

      if (stock < quantity) {
        throw AppError.conflict(
          `Stock insuficiente de "${product.title}": quedan ${stock} y pedís ${quantity}`
        );
      }

      const price = Number(product.price) || 0;
      const subtotal = round2(price * quantity);

      items.push({
        product: product.id,
        title: product.title,
        price,
        quantity,
        subtotal,
      });

      total += subtotal;
    }

    const buyerId = cart.owner || (user ? user.id : undefined);
    if (!buyerId) {
      throw AppError.badRequest("El carrito no tiene un dueño asignado");
    }

    const order = await this.ordersRepository.create({
      user: buyerId,
      cart: cart.id,
      items,
      total: round2(total),
      status: "paid",
    });

    for (const item of items) {
      await this.productsRepository.decrementStock(item.product, item.quantity);
    }

    await this.cartsRepository.clearCart(cart.id);

    return order;
  }
}

module.exports = CartsService;