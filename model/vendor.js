import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    vendorId: { type: String, unique: true }, // PRD-001, PRD-002, etc.
    vendor_name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
