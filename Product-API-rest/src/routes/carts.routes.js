const express = require("express");
const router = express.Router();
const container = require("../di/container");
const { requireAuth } = require("../middleware/auth.middleware");
const { requireCartOwnership } = require("../middleware/ownership.middleware");

const cartsController = container.cartsController;
const ownCart = requireCartOwnership(container.cartsRepository);

router.get("/", requireAuth, cartsController.getCarts);
router.post("/", requireAuth, cartsController.createCart);
router.get("/:cid", requireAuth, ownCart, cartsController.getCartById);
router.post("/:cid/products/:pid", requireAuth, ownCart, cartsController.addProduct);
router.delete("/:cid/products/:pid", requireAuth, ownCart, cartsController.deleteProduct);
router.put("/:cid", requireAuth, ownCart, cartsController.updateCart);
router.put("/:cid/products/:pid", requireAuth, ownCart, cartsController.updateProductQuantity);
router.delete("/:cid/products", requireAuth, ownCart, cartsController.clearCart);
router.post("/:cid/purchase", requireAuth, ownCart, cartsController.purchaseCart);
router.delete("/:cid", requireAuth, ownCart, cartsController.deleteCart);

module.exports = router;