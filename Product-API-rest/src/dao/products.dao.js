const fs = require("fs").promises;
const crypto = require("crypto");

class ProductsDao {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async #readFile() {
    try {
      const data = await fs.readFile(this.filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        await this.#saveFile([]); // crea archivo vacío si no existe
        return [];
      }
      throw error; // dejamos que lo maneje arriba
    }
  }

  async #saveFile(products) {
    await fs.writeFile(this.filePath, JSON.stringify(products, null, 2), "utf8");
  }

  #generateId() {
    return crypto.randomUUID();
  }

  async getAll() {
    const products = await this.#readFile();
    return JSON.parse(JSON.stringify(products)); // devuelve copia segura
  }

  async getById(id) {
    const products = await this.#readFile();
    return products.find((p) => p.id === id);
  }

  async create(product) {
    const products = await this.#readFile();
    const newProduct = { ...product, id: this.#generateId() };
    products.push(newProduct);
    await this.#saveFile(products);
    return newProduct;
  }

  async update(id, updatedFields) {
    const products = await this.#readFile();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) throw new Error("Producto no encontrado");

    const updatedProduct = {
      ...products[index],
      ...updatedFields,
      id, // aseguramos que no se sobrescriba el id
    };

    products[index] = updatedProduct;
    await this.#saveFile(products);
    return updatedProduct;
  }

  async decrementStock(id, quantity) {
    const products = await this.#readFile();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) throw new Error("Producto no encontrado");

    const product = products[index];
    const stock = Number(product.stock);

    if (!Number.isFinite(stock)) {
      throw new Error(`El producto ${product.title} no tiene stock cargado`);
    }

    if (stock < quantity) {
      throw new Error(
        `Stock insuficiente de "${product.title}": quedan ${stock} y se piden ${quantity}`
      );
    }

    product.stock = stock - quantity;
    products[index] = product;
    await this.#saveFile(products);
    return product;
  }

  async delete(id) {
    const products = await this.#readFile();
    const filteredProducts = products.filter((p) => p.id !== id);

    if (products.length === filteredProducts.length) {
      throw new Error("Producto no encontrado");
    }

    await this.#saveFile(filteredProducts);
    return id;
  }
}

module.exports = ProductsDao;
