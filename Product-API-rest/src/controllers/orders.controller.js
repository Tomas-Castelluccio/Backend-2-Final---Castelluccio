class OrdersController {
  constructor(ordersService) {
    this.ordersService = ordersService;
  }

  getOrders = async (req, res, next) => {
    try {
      const orders = await this.ordersService.getOrders(req.user);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (req, res, next) => {
    try {
      const { oid } = req.params;
      const order = await this.ordersService.getOrderById(oid);
      res.json(order);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const { oid } = req.params;
      const { status } = req.body;
      const order = await this.ordersService.updateStatus(oid, status, req.user);
      res.json(order);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = OrdersController;