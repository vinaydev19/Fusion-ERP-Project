import mongoose, { Schema } from "mongoose";

const purchaseHistory = new Schema(
  {
    saleMongodbId: {
      type: Schema.Types.ObjectId,
      ref: "Sale"
    },
    saleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    saleItem: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    salesDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
)

const customerSchema = new Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    purchaseHistory: [purchaseHistory],
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

export const Customer = mongoose.model("Customer", customerSchema);
