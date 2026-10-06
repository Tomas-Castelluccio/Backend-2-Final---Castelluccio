const express = require("express");
const router = express.Router();
const container = require("../di/container");
const { requireAuth } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/authorization.middleware");

const productsController = container.productsController;

router.get("/", productsController.getProducts);
router.get("/:pid", productsController.getProductById);
router.post("/", requireAuth, adminOnly, productsController.createProduct);
router.put("/:pid", requireAuth, adminOnly, productsController.updateProduct);
router.delete("/:pid", requireAuth, adminOnly, productsController.deleteProduct);

module.exports = router;