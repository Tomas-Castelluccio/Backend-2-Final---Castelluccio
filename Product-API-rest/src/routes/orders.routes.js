const express = require("express");
const router = express.Router();
const container = require("../di/container");
const { requireAuth } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/authorization.middleware");
const { requireOrderOwnership } = require("../middleware/ownership.middleware");

const ordersController = container.ordersController;
const ownOrder = requireOrderOwnership(container.ordersRepository);

router.get("/", requireAuth, ordersController.getOrders);
router.get("/:oid", requireAuth, ownOrder, ordersController.getOrderById);
router.put("/:oid/status", requireAuth, adminOnly, ordersController.updateStatus);

module.exports = router;