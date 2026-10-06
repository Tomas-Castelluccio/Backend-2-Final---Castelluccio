const mongoose = require("mongoose");

const cartsCollection = "carts";

const cartsSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    index: true,
  },
  products: [
    {
      product: {
        type: String,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      _id: false,
    },
  ],
});

const cartsModel = mongoose.model(cartsCollection, cartsSchema);

module.exports = cartsModel;