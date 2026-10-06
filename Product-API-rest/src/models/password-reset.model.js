const mongoose = require("mongoose");

const passwordResetsCollection = "passwordresets";

const passwordResetSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetModel = mongoose.model(
  passwordResetsCollection,
  passwordResetSchema
);

module.exports = PasswordResetModel;
