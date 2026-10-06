const mongoose = require("mongoose");
const { ordersModel } = require("../models/orders.model");

class OrdersDao {
  #isValidId(id) {
    return mongoose.isValidObjectId(id);
  }

  async create(order) {
    const created = await ordersModel.create(order);
    return created.toObject();
  }

  async getAll() {
    return ordersModel.find().sort({ createdAt: -1 }).lean();
  }

  async getByUser(userId) {
    if (!this.#isValidId(userId)) return [];
    return ordersModel.find({ user: userId }).sort({ createdAt: -1 }).lean();
  }

  async getById(id) {
    if (!this.#isValidId(id)) return null;
    return ordersModel.findById(id).lean();
  }

  async updateStatus(id, status) {
    const updated = await ordersModel
      .findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
      .lean();

    if (!updated) throw new Error("Orden no encontrada");
    return updated;
  }
}

module.exports = OrdersDao;