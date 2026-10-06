const { AppError } = require("../errors/app-error");
const { ORDER_STATUSES } = require("../models/orders.model");

class OrdersService {
  constructor(ordersRepository) {
    this.ordersRepository = ordersRepository;
  }

  async getOrders(user) {
    if (user.role === "admin") return this.ordersRepository.findAll();
    return this.ordersRepository.findByUser(user.id);
  }

  async getOrderById(id) {
    if (!id) throw AppError.badRequest("ID de orden requerido");
    const order = await this.ordersRepository.findById(id);
    if (!order) throw AppError.notFound("Orden no encontrada");
    return order;
  }

  async updateStatus(id, status, user) {
    if (user.role !== "admin") {
      throw AppError.forbidden("Solo el administrador puede cambiar el estado de una orden");
    }

    if (!ORDER_STATUSES.includes(status)) {
      throw AppError.badRequest(
        `Estado inválido. Valores permitidos: ${ORDER_STATUSES.join(", ")}`
      );
    }

    const order = await this.ordersRepository.findById(id);
    if (!order) throw AppError.notFound("Orden no encontrada");

    return this.ordersRepository.updateStatus(id, status);
  }
}

module.exports = OrdersService;