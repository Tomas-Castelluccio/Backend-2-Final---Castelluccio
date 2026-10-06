const mongoose = require("mongoose");
const CartsModel = require("../models/carts.model");

class CartsDao {
  #isValidId(id) {
    return mongoose.isValidObjectId(id);
  }

  async getAll() {
    return CartsModel.find().lean();
  }

  async getByOwner(ownerId) {
    if (!this.#isValidId(ownerId)) return [];
    return CartsModel.find({ owner: ownerId }).lean();
  }

  async getById(id) {
    if (!this.#isValidId(id)) return null;
    return CartsModel.findById(id).lean();
  }

  async create(ownerId) {
    const newCart = await CartsModel.create({
      products: [],
      owner: this.#isValidId(ownerId) ? ownerId : undefined,
    });
    return newCart.toObject();
  }

  async addProduct(cid, pid) {
    const cart = await CartsModel.findById(cid);
    if (!cart) throw new Error("Carrito no encontrado");

    const productIndex = cart.products.findIndex((p) => p.product === pid);

    if (productIndex === -1) {
      cart.products.push({ product: pid, quantity: 1 });
    } else {
      cart.products[productIndex].quantity += 1;
    }

    const saved = await cart.save();
    return saved.toObject();
  }

  async deleteProduct(cid, pid) {
    const cart = await CartsModel.findById(cid);
    if (!cart) throw new Error("Carrito no encontrado");

    cart.products = cart.products.filter((p) => p.product !== pid);

    const saved = await cart.save();
    return saved.toObject();
  }

  async updateCart(cid, products) {
    const updated = await CartsModel.findByIdAndUpdate(
      cid,
      { products },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) throw new Error("Carrito no encontrado");
    return updated;
  }

  async updateProductQuantity(cid, pid, quantity) {
    const cart = await CartsModel.findById(cid);
    if (!cart) throw new Error("Carrito no encontrado");

    const productIndex = cart.products.findIndex((p) => p.product === pid);

    if (productIndex === -1) throw new Error("Producto no encontrado en carrito");

    if (quantity <= 0) {
      cart.products.splice(productIndex, 1);
    } else {
      cart.products[productIndex].quantity = quantity;
    }

    const saved = await cart.save();
    return saved.toObject();
  }

  async clearCart(cid) {
    const cart = await CartsModel.findById(cid);
    if (!cart) throw new Error("Carrito no encontrado");

    cart.products = [];

    const saved = await cart.save();
    return saved.toObject();
  }

  async delete(id) {
    const deleted = await CartsModel.findByIdAndDelete(id);
    if (!deleted) throw new Error("Carrito no encontrado");
    return id;
  }
}

module.exports = CartsDao;
