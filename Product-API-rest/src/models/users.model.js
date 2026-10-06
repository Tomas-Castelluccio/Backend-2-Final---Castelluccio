const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const usersCollection = "users";

const usersSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true,
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: 0,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Carts",
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

usersSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  const salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
  next();
});

usersSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const usersModel = mongoose.model(usersCollection, usersSchema);

module.exports = usersModel;