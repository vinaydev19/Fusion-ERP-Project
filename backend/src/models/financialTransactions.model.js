import mongoose, { Schema } from "mongoose";

const financialSchema = new Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Income", "Expense"],
    },
    financialDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    fromAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    fromCurrency: {
      type: String,
      required: true,
      trim: true,
    },
    toAmount: {
      type: Number,
      min: 0,
    },
    toCurrency: {
      type: String,
      trim: true,
    },
    exchangeRate: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Cash", "Bank Transfer", "Credit Card", "Others"],
    },
    account: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Completed", "Failed", "Cancelled"],
    },
    invoiceId: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Financial = mongoose.model("Financial", financialSchema);
