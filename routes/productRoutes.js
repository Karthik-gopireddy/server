import express from "express";
import {
  getAllProducts,
  createProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts,
  getAllapprovedProducts,
  assignOrderToEmployee,
  getEmployeeOrders,
} from "../controller/productController.js";
import { errorHandler } from "../middlewares/errorHandler.js";
import upload from "../middlewares/upload.js";
import { protect } from "../middlewares/authMiddleware.js";
import { access } from "../middlewares/accessMiddleware.js";

const router = express.Router();

router.get(
  "/allProducts",
  protect,
  access("ADMIN", "VENDOR", "USER"),
  getAllProducts
);

router.get(
  "/getAllapprovedProducts",
  protect,
  access("ADMIN", "VENDOR", "USER"),
  getAllapprovedProducts
);

router.post(
  "/createProduct",
  protect,
  access("ADMIN", "VENDOR"),
  upload.fields([
    { name: "images", maxCount: 20 },
    { name: "videos", maxCount: 5 },
  ]),

  createProduct
);

router.get(
  "/singleProduct/:id",
  protect,
  access("ADMIN", "VENDOR", "USER"),
  getSingleProduct
);

// GET /vendors/:vendorId/products
router.get("/vendorProducts/:vendorId", protect, getVendorProducts);

router.put("/assign", protect, access("ADMIN"), assignOrderToEmployee);

router.get("/employee/orders", protect, access("EMPLOYEE"), getEmployeeOrders);

router.post(
  "/updateProduct/:id",
  protect,
  access("ADMIN", "VENDOR","EMPLOYEE"),
  updateProduct
);

router.delete(
  "/deleteProduct/:id",
  protect,
  access("ADMIN", "VENDOR"),
  deleteProduct
);

router.use(errorHandler);

export default router;
