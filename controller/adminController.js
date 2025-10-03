import Admin from "../model/admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { STATUSCODE } from "../utils/constants.js";
import { roleType } from "../utils/roles.js";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin@123";

// 🔹 Ensure admin exists in DB (called at server startup)
export const ensureAdminExists = async () => {
  try {
    const admin = await Admin.findOne({ email: ADMIN_EMAIL });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await Admin.create({
        adminName: "Super Admin",
        email: ADMIN_EMAIL,
        password: hashedPassword,
      });
      console.log("✅ Default Admin created in DB");
    } else {
      console.log("✅ Default Admin already exists in DB");
    }
  } catch (error) {
    console.error("❌ Error ensuring default admin:", error.message);
  }
};

// --- Register (disable manual registration)
export const createadmin = async (req, res, next) => {
  try {
    return res
      .status(STATUSCODE.FAILURE)
      .json({ message: "Admin registration is disabled. Use default admin." });
  } catch (error) {
    next(error);
  }
};

// --- Login
export const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // check only default admin
    if (email !== ADMIN_EMAIL) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "Invalid admin email" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "Admin not found in database" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "Incorrect password" });
    }

    const token = jwt.sign(
      { adminId: admin._id, roleType: roleType.ADMIN },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(STATUSCODE.SUCCESS).json({
      token,
      message: "Admin logged in successfully",
    });
  } catch (error) {
    next(error);
  }
};

// --- Forgot Password (optional, resets only for constant admin)
export const forgotPassword = async (req, res, next) => {
  try {
    const { email, password, conformPassword } = req.body;

    if (email !== ADMIN_EMAIL) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "Only default admin can reset password" });
    }

    if (password !== conformPassword) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "Password does not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedAdmin = await Admin.findOneAndUpdate(
      { email: ADMIN_EMAIL },
      { password: hashedPassword },
      { new: true }
    );

    const token = jwt.sign(
      { adminId: updatedAdmin._id, roleType: roleType.ADMIN },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(STATUSCODE.SUCCESS).json({
      token,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
