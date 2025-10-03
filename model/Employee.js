import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, unique: true }, // 👈 EMP-001 etc
    role: {
      type: String,
      default: "employee",
    },

    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    altMobile: { type: String },
    address: { type: String, required: true },
    aadhar: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    aadhaarFront: { type: String }, // S3 file URL
    aadhaarBack: { type: String }, // S3 file URL
    assignedOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
