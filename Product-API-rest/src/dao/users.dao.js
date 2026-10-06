const mongoose = require("mongoose");
const UsersModel = require("../models/users.model");

class UsersDao {
  #isValidId(id) {
    return mongoose.isValidObjectId(id);
  }

  async getAll() {
    return UsersModel.find().select("-password").lean();
  }

  async getById(id) {
    if (!this.#isValidId(id)) return null;
    return UsersModel.findById(id).select("-password").lean();
  }

  async getByEmail(email) {
    return UsersModel.findOne({ email: email.toLowerCase() })
      .select("-password")
      .lean();
  }

  async getByIdWithPassword(id) {
    if (!this.#isValidId(id)) return null;
    return UsersModel.findById(id);
  }

  async create(userData) {
    const user = await UsersModel.create(userData);
    return UsersModel.findById(user._id).select("-password").lean();
  }

  async update(id, fields) {
    const user = await UsersModel.findById(id);
    if (!user) throw new Error("Usuario no encontrado");

    if (fields.first_name !== undefined) user.first_name = fields.first_name;
    if (fields.last_name !== undefined) user.last_name = fields.last_name;
    if (fields.email !== undefined) user.email = fields.email;
    if (fields.age !== undefined) user.age = fields.age;
    if (fields.password !== undefined && fields.password !== "") user.password = fields.password;
    if (fields.cart !== undefined) user.cart = fields.cart;
    if (fields.role !== undefined) user.role = fields.role;

    await user.save();
    return UsersModel.findById(id).select("-password").lean();
  }

  async delete(id) {
    const deleted = await UsersModel.findByIdAndDelete(id);
    if (!deleted) throw new Error("Usuario no encontrado");
    return id;
  }
}

module.exports = UsersDao;
