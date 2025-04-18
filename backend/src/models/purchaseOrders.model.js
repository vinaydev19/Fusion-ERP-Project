import mongoose, { Schema } from "mongoose";

const ProductsSchema = new Schema({
  productMongodbId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
  },

});

const purchaseSchema = new Schema(
  {
    purchaseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    supplierId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    supplierName: {
      type: String,
      required: true,
      trim: true,
    },
    supplierContact: {
      type: String,
      required: true,
      trim: true,
    },
    supplierEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    supplierAddress: {
      type: String,
      required: true,
      trim: true,
    },
    products: {
      type: [ProductsSchema],
      required: true,
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Paid", "Cancelled", "Partial"],
    },
    notes: {
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

export const Purchase = mongoose.model("Purchase", purchaseSchema);
