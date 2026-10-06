const PasswordResetModel = require("../models/password-reset.model");

class PasswordResetDao {
  async create(data) {
    return PasswordResetModel.create(data);
  }

  async findActiveByTokenHash(hash) {
    return PasswordResetModel.findOne({ token: hash, used: false }).lean();
  }

  async markAsUsed(id) {
    return PasswordResetModel.findByIdAndUpdate(id, { used: true }, { new: true });
  }

  async deleteActiveByEmail(email) {
    await PasswordResetModel.deleteMany({ email: email.toLowerCase(), used: false });
  }
}

module.exports = PasswordResetDao;
