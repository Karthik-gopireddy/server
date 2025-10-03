import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { STATUSCODE } from "../utils/constants.js";
import {
  adminRegister,
  adminLogin,
  vendorRegister,
  vendorLogin,
} from "../utils/validation.js";
import { roleType } from "../utils/roles.js";
import Vendor from "../model/vendor.js";
import Counter from "../model/Counter.js";

export const createVendor = async (req, res, next) => {
  try {
    const { vendor_name, email, mobile, password } = req.body;

    const validationError = vendorRegister(req.body);

    if (validationError.errorArray) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: validationError.errorArrays[0] });
    }

    const vendorExists = await Vendor.findOne({ email });

    if (vendorExists) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "Vendor already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // const counter = await Counter.findOneAndUpdate(
    //   { id: "vendorId" },
    //   { $inc: { seq: 1 } },
    //   { new: true, upsert: true }
    // );

    // const vendorId = `VD-${String(counter.seq).padStart(3, "0")}`;

    const lastVendor = await Vendor.findOne().sort({ createdAt: -1 }).lean();

    let newSeq = 1; // default if no vendors yet

    if (lastVendor?.vendorId) {
      // Extract the numeric part from vendorId e.g. "VD-005" → 5
      const lastSeq = parseInt(lastVendor.vendorId.replace("VD-", ""), 10);
      newSeq = lastSeq + 1;
    }

    // Step 2: Generate new vendorId
    const vendorId = `VD-${String(newSeq).padStart(3, "0")}`;
    const vendor = await Vendor.create({
      vendorId,
      vendor_name,
      email,
      mobile,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { vendorId: vendor._id, roleType: roleType.VENDOR },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Send vendor details along with token
    res.status(STATUSCODE.SUCCESS).json({
      token,
      message: "Vendor created successfully",
      vendor: {
        _id: vendor._id,
        vendorId: vendor.vendorId,
        vendor_name: vendor.vendor_name,
        email: vendor.email,
        mobile: vendor.mobile,
        isVerified: vendor.isVerified,
        createdAt: vendor.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const validationError = vendorLogin(req.body);
    if (validationError?.errorArray) {
      return res
        .status(STATUSCODE?.FAILURE)
        .json({ message: validationError?.errorArrays[0] });
    }

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res
        .status(STATUSCODE?.FAILURE)
        .json({ message: "vendor does not exist" });
    }

    const isMatch = await bcrypt.compare(password, vendor?.password);
    if (!isMatch) {
      return res
        .status(STATUSCODE?.FAILURE)
        .json({ message: "Incorrect Password" });
    }

    const token = jwt.sign(
      { vendorId: vendor._id, roleType: roleType?.VENDOR },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.status(STATUSCODE.SUCCESS).json({
      token,
      vendor: {
        _id: vendor._id,
        vendorId: vendor?.vendorId,
        vendor_name: vendor.vendor_name,
        email: vendor.email,
        isVerified: vendor.isVerified,
        createdAt: vendor.createdAt,
      },
      message: "Vendor logged in successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, password, conformPassword } = req.body;

    const isExist = await Vendor.findOne({ email });

    if (!isExist) {
      return res
        .status(STATUSCODE?.FAILURE)
        .json({ message: "Vendor not found" });
    }

    if (password !== conformPassword) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "Password does not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const vendor = await Vendor.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );
    const token = jwt.sign(
      { vendorId: vendor._id, roleType: roleType.VENDOR },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res
      .status(STATUSCODE.SUCCESS)
      .json({ token, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

export const vendorDetails = async (req, res, next) => {
  try {
    const vendor = await Vendor.find({}).sort({ _id: -1 });
    if (!vendor) {
      return res.status(STATUSCODE.NO_DATA).json({ message: "No Data" });
    }
    res.status(200).json(vendor);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getSingleVendor = async (req, res, next) => {
  try {
    if (!req?.params?.id) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "Vendor id is required" });
    }
    const vendor = await Vendor?.findById(req.params.id);
    if (!vendor) {
      return res.status(STATUSCODE.NO_DATA).json({ message: "No Data" });
    }
    res.status(200).json(vendor);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
