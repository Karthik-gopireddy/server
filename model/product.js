import mongoose, { Schema } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, unique: true }, // PRD-001, PRD-002, etc.
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    price: { type: Number, required: true },
    address: { type: String, required: true },
    features: { type: [String] },
    images: { type: [String] },
    videos: { type: [String] },
    isActive: { type: Boolean, default: false },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    assignedAt: { type: Date },
    assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
