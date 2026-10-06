const mongoose = require("mongoose");

const ordersCollection = "orders";

const ORDER_STATUSES = ["paid", "shipped", "delivered", "cancelled"];

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const ordersSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "carts",
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "La orden debe tener al menos un producto",
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "paid",
    },
  },
  { timestamps: true }
);

const ordersModel = mongoose.model(ordersCollection, ordersSchema);

module.exports = { ordersModel, ORDER_STATUSES };