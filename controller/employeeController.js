import Employee from "../model/Employee.js";

import jwt from "jsonwebtoken";
import { STATUSCODE } from "../utils/constants.js";
import { roleType } from "../utils/roles.js";

// Create Employee
export const createEmployee = async (req, res) => {
  try {
    const { fullName, email, mobile, altMobile, address, aadhar, password } =
      req.body;

    // Get uploaded file URLs from AWS S3
    const aadhaarFront = req.files?.aadhaarFront?.[0]?.location || null;
    const aadhaarBack = req.files?.aadhaarBack?.[0]?.location || null;

    // 🔹 Generate Employee ID (EMP-001, EMP-002, ...)
    const lastEmployee = await Employee.findOne().sort({ createdAt: -1 });
    let newIdNumber = 1;

    if (lastEmployee?.employeeId) {
      const lastId = parseInt(lastEmployee.employeeId.split("-")[1]); // get number part
      newIdNumber = lastId + 1;
    }

    const employeeId = `EMP-${String(newIdNumber).padStart(3, "0")}`;

    // Create employee
    const newEmployee = new Employee({
      employeeId,
      fullName,
      email,
      mobile,
      altMobile,
      address,
      aadhar,
      password,
      aadhaarFront,
      aadhaarBack,
    });

    await newEmployee.save();
    res
      .status(201)
      .json({ message: "✅ Employee created", employee: newEmployee });
  } catch (error) {
    res
      .status(500)
      .json({ message: "❌ Error creating employee", error: error.message });
  }
};

// Get All Employees
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res
      .status(500)
      .json({ message: "❌ Error fetching employees", error: error.message });
  }
};

// Get One Employee
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Employee
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "✅ Employee deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params; // employee _id or employeeId (EMP-001 etc.)
    const { fullName, email, mobile, altMobile, address, aadhar, password } =
      req.body;

    // Handle new uploaded files if any
    const aadhaarFront = req.files?.aadhaarFront?.[0]?.location;
    const aadhaarBack = req.files?.aadhaarBack?.[0]?.location;

    // Build update object
    const updateData = {
      fullName,
      email,
      mobile,
      altMobile,
      address,
      aadhar,
      password,
    };

    // Only set if new files uploaded
    if (aadhaarFront) updateData.aadhaarFront = aadhaarFront;
    if (aadhaarBack) updateData.aadhaarBack = aadhaarBack;

    // Find employee and update
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "❌ Employee not found" });
    }

    res.status(200).json({
      message: "✅ Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Error updating employee",
      error: error.message,
    });
  }
};

export const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // const validationError = employyeeLogin(req.body);
    // if (validationError?.errorArray) {
    //   return res
    //     .status(STATUSCODE?.FAILURE)
    //     .json({ message: validationError?.errorArrays[0] });
    // }

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res
        .status(STATUSCODE?.FAILURE)
        .json({ message: "Employee does not exist" });
    }

    // 🔹 Plain string comparison instead of bcrypt
    if (password !== employee?.password) {
      return res
        .status(STATUSCODE?.FAILURE)
        .json({ message: "Incorrect Password" });
    }

    const token = jwt.sign(
      { employeeId: employee._id, roleType: roleType?.EMPLOYEE },
      process.env.JWT_SECRET,
      { expiresIn: "60d" }
    );

    res.status(STATUSCODE.SUCCESS).json({
      token,
      role:"employee",
      employee,
      message: "Employee logged in successfully",
    });
  } catch (error) {
    next(error);
  }
};
