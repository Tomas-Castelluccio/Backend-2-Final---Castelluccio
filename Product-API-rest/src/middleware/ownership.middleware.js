const { AppError } = require("../errors/app-error");
const logger = require("../utils/logger");

const isAdmin = (req) => req.user && req.user.role === "admin";

const requireOwnership = ({ repository, param, entityName, attachAs }) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[param];
      const resource = await repository.findById(resourceId);

      if (!resource) {
        throw AppError.notFound(
          `${entityName} con id ${resourceId} no encontrado`
        );
      }

      if (isAdmin(req)) {
        if (attachAs) req[attachAs] = resource;
        return next();
      }

      if (!resource.owner) {
        logger.warn("Recurso sin dueño, acceso denegado", {
          entity: entityName,
          id: resourceId,
          user: req.user.id,
        });
        throw AppError.forbidden(
          `No tenés permisos sobre este ${entityName}`
        );
      }

      if (resource.owner.toString() !== req.user.id.toString()) {
        logger.warn("Intento de acceso a recurso ajeno", {
          entity: entityName,
          id: resourceId,
          user: req.user.id,
        });
        throw AppError.forbidden(`Este ${entityName} no es tuyo`);
      }

      if (attachAs) req[attachAs] = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

const requireCartOwnership = (cartsRepository) =>
  requireOwnership({
    repository: cartsRepository,
    param: "cid",
    entityName: "carrito",
    attachAs: "cart",
  });

const requireOrderOwnership = (ordersRepository) =>
  requireOwnership({
    repository: ordersRepository,
    param: "oid",
    entityName: "orden",
    attachAs: "order",
  });

module.exports = { requireOwnership, requireCartOwnership, requireOrderOwnership };