const PasswordResetDao = require("../dao/password-reset.dao");

class PasswordResetRepository {
  constructor(passwordResetDao) {
    this.passwordResetDao = passwordResetDao || new PasswordResetDao();
  }

  #toEntity(doc) {
    if (!doc) return null;
    return {
      id: (doc._id || doc.id).toString(),
      email: doc.email,
      expiresAt: doc.expiresAt,
      used: doc.used,
    };
  }

  async create(data) {
    const doc = await this.passwordResetDao.create(data);
    return this.#toEntity(doc.toObject());
  }

  async findActiveByTokenHash(hash) {
    const doc = await this.passwordResetDao.findActiveByTokenHash(hash);
    return this.#toEntity(doc);
  }

  async markAsUsed(id) {
    const doc = await this.passwordResetDao.markAsUsed(id);
    return this.#toEntity(doc.toObject());
  }

  async invalidateActiveByEmail(email) {
    return this.passwordResetDao.deleteActiveByEmail(email);
  }
}

module.exports = PasswordResetRepository;
