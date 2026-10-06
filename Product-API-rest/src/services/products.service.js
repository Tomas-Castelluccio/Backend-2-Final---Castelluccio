class ProductsService {
  constructor(productsRepository) {
    this.productsRepository = productsRepository;
  }

  async getAllProducts() {
    return this.productsRepository.findAll();
  }

  async getProductById(id) {
    if (!id) throw new Error("ID requerido");
    return this.productsRepository.findById(id);
  }

  async createProduct(productData) {
    const requiredFields = ["title", "code", "price", "status", "stock", "category", "thumbnails"];
    const missingFields = requiredFields.filter((field) => !productData[field]);

    if (missingFields.length > 0) {
      throw new Error(
        `Campos requeridos faltantes: ${missingFields.join(", ")}`
      );
    }

    if (typeof productData.price !== "number") {
      throw new Error("Price debe ser un número");
    }

    if (typeof productData.stock !== "number") {
      throw new Error("Stock debe ser un número");
    }

    if (typeof productData.status !== "boolean") {
      throw new Error("Status debe ser un booleano");
    }

    if (!Array.isArray(productData.thumbnails)) {
      throw new Error("Thumbnails debe ser un array de strings");
    }

    return this.productsRepository.create(productData);
  }

  async updateProduct(pid, updateData) {
    if (!pid) throw new Error("ID requerido");
    const existing = await this.productsRepository.findById(pid);
    if (!existing) throw new Error("Producto no encontrado");
    return this.productsRepository.update(pid, updateData);
  }

  async deleteProduct(pid) {
    if (!pid) throw new Error("ID requerido");
    const existing = await this.productsRepository.findById(pid);
    if (!existing) throw new Error("Producto no encontrado");
    return this.productsRepository.delete(pid);
  }
}

module.exports = ProductsService;
