import express from "express";
import upload from "../middlewares/upload.js";
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  deleteEmployee,
  updateEmployee,
  Login,
} from "../controller/employeeController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { access } from "../middlewares/accessMiddleware.js";

const router = express.Router();

// Create employee with Aadhaar uploads
router.post(
  "/",
  protect,
  access("ADMIN","USER"),
  upload.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
  ]),
  createEmployee
);

router.post("/login", Login);

router.get("/", protect, access("ADMIN"), getEmployees);
router.get("/:id", getEmployeeById);
router.delete("/:id", protect, access("ADMIN"), deleteEmployee);

router.put(
  "/:id",
  upload.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
  ]),
  updateEmployee
);

export default router;
