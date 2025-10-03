import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import productRoutes from "./routes/productRoutes.js";

import authRoutes from "./routes/adminRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";

import userRoutes from "./routes/userRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js"
import { protect } from "./middlewares/authMiddleware.js";
import { ensureAdminExists } from "./controller/adminController.js";
import cors from "cors";

dotenv.config();
connectDB();
const app = express();
app.use(express.json());

app.use(cors());

ensureAdminExists();

app.get("/", (req, res) => {
  res.send("Backend Server is working");
});

app.use("/api/admin", authRoutes);

app.use("/api/vendor", vendorRoutes);

app.use("/api/user", userRoutes);

app.use("/api/products", productRoutes);
app.use("/api/employee", employeeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
