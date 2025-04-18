import mongoose, { Schema } from "mongoose";

const productsSchema = new Schema({
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
  productImage: {
    type: String,
    required: true,
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
});


const deliverySchema = new Schema(
  {
    deliveryId: {
      type: String,
      required: true,
      unique: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerContact: {
      type: String,
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },
    products: {
      type: [productsSchema],
      required: true,
    },
    deliveryMethod: {
      type: String,
      required: true,
      trim: true,
      enum: ["Standard Shipping", "Express Shipping", "Same Day Delivery", "International Shipping"]
    },
    trackingNumber: {
      type: String,
    },
    courierDetails: {
      type: String,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0, // Default to 0, will be calculated before saving
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Paid", "Failed"],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Cash", "Bank Transfer", "Credit Card", "Others"],
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

export const Delivery = mongoose.model("Delivery", deliverySchema);
