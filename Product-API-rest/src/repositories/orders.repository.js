const OrdersDao = require("../dao/orders.dao");

class OrdersRepository {
  constructor(ordersDao) {
    this.ordersDao = ordersDao || new OrdersDao();
  }

  #toEntity(doc) {
    if (!doc) return null;
    return {
      id: (doc._id || doc.id).toString(),
      user: (doc.user._id || doc.user).toString(),
      cart: doc.cart ? (doc.cart._id || doc.cart).toString() : null,
      items: doc.items,
      total: doc.total,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(order) {
    const doc = await this.ordersDao.create(order);
    return this.#toEntity(doc);
  }

  async findAll() {
    const docs = await this.ordersDao.getAll();
    return docs.map((doc) => this.#toEntity(doc));
  }

  async findByUser(userId) {
    const docs = await this.ordersDao.getByUser(userId);
    return docs.map((doc) => this.#toEntity(doc));
  }

  async findById(id) {
    const doc = await this.ordersDao.getById(id);
    return this.#toEntity(doc);
  }

  async updateStatus(id, status) {
    const doc = await this.ordersDao.updateStatus(id, status);
    return this.#toEntity(doc);
  }
}

module.exports = OrdersRepository;