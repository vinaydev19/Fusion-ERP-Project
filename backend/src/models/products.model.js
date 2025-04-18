import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    productImage: {
      type: String,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    expirationDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > new Date();
        },
        message: "Expiration date must be in the future",
      },
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    dateAdded: {
      type: Date,
    },
    warehouse: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Low Stock", "Out of Stock", "Available"],
      default: "Available",
      required: true
    },
    supplierName: {
      type: String,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);


export const Product = mongoose.model("Product", productSchema);
