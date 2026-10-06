class CartsController {
  constructor(cartsService) {
    this.cartsService = cartsService;
  }

  getCarts = async (req, res, next) => {
    try {
      const carts = await this.cartsService.getCarts(req.user);
      res.json(carts);
    } catch (error) {
      next(error);
    }
  };

  getCartById = async (req, res, next) => {
    try {
      const { cid } = req.params;
      const cart = await this.cartsService.getCartById(cid);
      if (!cart) {
        return res.status(404).json({ message: "Carrito no encontrado" });
      }
      res.json(cart);
    } catch (error) {
      next(error);
    }
  };

  createCart = async (req, res, next) => {
    try {
      const newCart = await this.cartsService.createCart(req.user);
      res.status(201).json(newCart);
    } catch (error) {
      next(error);
    }
  };

  purchaseCart = async (req, res, next) => {
    try {
      const { cid } = req.params;
      const order = await this.cartsService.purchaseCart(cid, req.user);
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  };

  addProduct = async (req, res, next) => {
    try {
      const { cid, pid } = req.params;
      const updatedCart = await this.cartsService.addProduct(cid, pid);
      res.json(updatedCart);
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req, res, next) => {
    try {
      const { cid, pid } = req.params;
      const updatedCart = await this.cartsService.deleteProduct(cid, pid);
      res.json(updatedCart);
    } catch (error) {
      next(error);
    }
  };

  updateCart = async (req, res, next) => {
    try {
      const { cid } = req.params;
      const { products } = req.body;
      const updatedCart = await this.cartsService.updateCart(cid, products);
      res.json(updatedCart);
    } catch (error) {
      next(error);
    }
  };

  updateProductQuantity = async (req, res, next) => {
    try {
      const { cid, pid } = req.params;
      const { quantity } = req.body;
      const updatedCart = await this.cartsService.updateProductQuantity(cid, pid, quantity);
      res.json(updatedCart);
    } catch (error) {
      next(error);
    }
  };

  clearCart = async (req, res, next) => {
    try {
      const { cid } = req.params;
      const updatedCart = await this.cartsService.clearCart(cid);
      res.json(updatedCart);
    } catch (error) {
      next(error);
    }
  };

  deleteCart = async (req, res, next) => {
    try {
      const { cid } = req.params;
      const deletedId = await this.cartsService.deleteCart(cid);
      res.json({ id: deletedId, message: "Carrito eliminado" });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = CartsController;