const bcrypt = require("bcrypt");
const UsersDao = require("../dao/users.dao");

class UsersRepository {
  constructor(usersDao) {
    this.usersDao = usersDao || new UsersDao();
  }

  #toEntity(doc) {
    if (!doc) return null;

    let cart = null;
    if (doc.cart) {
      cart = doc.cart._id ? doc.cart._id.toString() : doc.cart.toString();
    }

    return {
      id: (doc._id || doc.id).toString(),
      first_name: doc.first_name,
      last_name: doc.last_name,
      email: doc.email,
      age: doc.age,
      cart,
      role: doc.role,
    };
  }

  async findAll() {
    const docs = await this.usersDao.getAll();
    return docs.map((doc) => this.#toEntity(doc));
  }

  async findById(id) {
    const doc = await this.usersDao.getById(id);
    return this.#toEntity(doc);
  }

  async findByEmail(email) {
    const doc = await this.usersDao.getByEmail(email);
    return this.#toEntity(doc);
  }

  async matchesPassword(id, password) {
    const doc = await this.usersDao.getByIdWithPassword(id);
    if (!doc) return false;
    return bcrypt.compareSync(password, doc.password);
  }

  async create(userData) {
    const doc = await this.usersDao.create(userData);
    return this.#toEntity(doc);
  }

  async update(id, fields) {
    const doc = await this.usersDao.update(id, fields);
    return this.#toEntity(doc);
  }

  async delete(id) {
    return this.usersDao.delete(id);
  }
}

module.exports = UsersRepository;
