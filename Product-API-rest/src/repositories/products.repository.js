const ProductsDao = require("../dao/products.dao");
const config = require("../../config/config");

class ProductsRepository {
  constructor(productsDao) {
    this.productsDao =
      productsDao || new ProductsDao(config.getFilePath("products.json"));
  }

  async findAll() {
    return this.productsDao.getAll();
  }

  async findById(id) {
    return this.productsDao.getById(id);
  }

  async create(product) {
    return this.productsDao.create(product);
  }

  async update(id, fields) {
    return this.productsDao.update(id, fields);
  }

  async delete(id) {
    return this.productsDao.delete(id);
  }

  async decrementStock(id, quantity) {
    return this.productsDao.decrementStock(id, quantity);
  }
}

module.exports = ProductsRepository;
