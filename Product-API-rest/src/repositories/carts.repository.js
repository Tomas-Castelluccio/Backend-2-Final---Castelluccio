const CartsDao = require("../dao/carts.dao");

class CartsRepository {
  constructor(cartsDao) {
    this.cartsDao = cartsDao || new CartsDao();
  }

  #toEntity(doc) {
    if (!doc) return null;
    return {
      id: (doc._id || doc.id).toString(),
      owner: doc.owner ? (doc.owner._id || doc.owner).toString() : null,
      products: doc.products,
    };
  }

  async findAll() {
    const docs = await this.cartsDao.getAll();
    return docs.map((doc) => this.#toEntity(doc));
  }

  async findByOwner(ownerId) {
    const docs = await this.cartsDao.getByOwner(ownerId);
    return docs.map((doc) => this.#toEntity(doc));
  }

  async findById(id) {
    const doc = await this.cartsDao.getById(id);
    return this.#toEntity(doc);
  }

  async create(ownerId) {
    const doc = await this.cartsDao.create(ownerId);
    return this.#toEntity(doc);
  }

  async addProduct(cid, pid) {
    const doc = await this.cartsDao.addProduct(cid, pid);
    return this.#toEntity(doc);
  }

  async deleteProduct(cid, pid) {
    const doc = await this.cartsDao.deleteProduct(cid, pid);
    return this.#toEntity(doc);
  }

  async updateCart(cid, products) {
    const doc = await this.cartsDao.updateCart(cid, products);
    return this.#toEntity(doc);
  }

  async updateProductQuantity(cid, pid, quantity) {
    const doc = await this.cartsDao.updateProductQuantity(cid, pid, quantity);
    return this.#toEntity(doc);
  }

  async clearCart(cid) {
    const doc = await this.cartsDao.clearCart(cid);
    return this.#toEntity(doc);
  }

  async delete(id) {
    return this.cartsDao.delete(id);
  }
}

module.exports = CartsRepository;
