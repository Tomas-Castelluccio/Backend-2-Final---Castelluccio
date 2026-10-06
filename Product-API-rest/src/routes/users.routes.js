const express = require("express");
const router = express.Router();
const container = require("../di/container");
const { requireAuth } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/authorization.middleware");

const usersController = container.usersController;

router.get("/", requireAuth, adminOnly, usersController.getAllUsers);
router.get("/:uid", requireAuth, usersController.getUserById);
router.post("/", requireAuth, adminOnly, usersController.createUser);
router.put("/:uid", requireAuth, adminOnly, usersController.updateUser);
router.delete("/:uid", requireAuth, adminOnly, usersController.deleteUser);

module.exports = router;