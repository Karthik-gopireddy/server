import Product from "../model/product.js";
import { STATUSCODE } from "../utils/constants.js";
import { createProductValidation } from "../utils/validation.js";
import mongoose from "mongoose";

import Counter from "../model/Counter.js";
import Employee from "../model/Employee.js";

export const createProduct = async (req, res, next) => {
  try {
    const validationError = createProductValidation(req.body);
    if (validationError?.errorArray?.length > 0) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: validationError.errorArray[0] });
    }

    if (
      (!req.files?.images || req.files.images.length === 0) &&
      (!req.files?.videos || req.files.videos.length === 0)
    ) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "At least one image or video is required" });
    }

    const imagePaths = req.files?.images?.map((file) => file.location) || [];
    const videoPaths = req.files?.videos?.map((file) => file.location) || [];

    // 🔹 Auto-increment productId
    // const counter = await Counter.findOneAndUpdate(
    //   { id: "productId" },
    //   { $inc: { seq: 1 } },
    //   { new: true, upsert: true }
    // );

    // const productId = `SRV-${String(counter.seq).padStart(3, "0")}`;

    const lastVendor = await Product.findOne().sort({ createdAt: -1 }).lean();

    let newSeq = 1; // default if no vendors yet

    if (lastVendor?.productId) {
      // Extract the numeric part from vendorId e.g. "VD-005" → 5
      const lastSeq = parseInt(lastVendor.productId.replace("SRV-", ""), 10);
      newSeq = lastSeq + 1;
    }

    // Step 2: Generate new vendorId
    const productId = `SRV-${String(newSeq).padStart(3, "0")}`;

    const product = new Product({
      ...req.body,
      productId,
      images: imagePaths,
      videos: videoPaths,
      vendorId: req.user.vendorId || req.user._id,
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const Products = await Product.find({})
      .sort({ _id: -1 }) // newest first
      .populate("vendorId")
      .populate("assignedEmployee");
    // populate vendorId, only return selected fields
    if (!Products) {
      return res.status(STATUSCODE.NO_DATA).json({ message: "No Data" });
    }
    res.status(200).json({ orders: Products });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getAllapprovedProducts = async (req, res, next) => {
  try {
    let { category } = req.query;
    console.log(category, "category");

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    // Convert category to lowercase and do a case-insensitive search
    const ApprovedProducts = await Product.find({
      category: { $regex: new RegExp(`^${category}$`, "i") }, // i = ignore case
      isActive: true,
    }).populate("vendorId");

    console.log(ApprovedProducts, "ApprovedProducts");

    if (!ApprovedProducts || ApprovedProducts.length === 0) {
      return res.status(404).json({ message: "No Data" });
    }

    res.status(200).json(ApprovedProducts);
  } catch (error) {
    console.error(error);
    next(error);
  }
};


export const getSingleProduct = async (req, res, next) => {
  try {
    if (!req?.params?.id) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "product id is required" });
    }
    const product = await Product?.findById(req.params.id);
    if (!product) {
      return res.status(STATUSCODE.NO_DATA).json({ message: "No Data" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getVendorProducts = async (req, res, next) => {
  try {
    if (!req?.params?.vendorId) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "vendor id is required" });
    }

    const products = await Product.find({ vendorId: req.params.vendorId });

    if (!products || products.length === 0) {
      return res
        .status(STATUSCODE.NO_DATA)
        .json({ message: "No products found" });
    }

    res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const assignOrderToEmployee = async (req, res) => {
  try {
    const { orderId, employeeId } = req.body;

    const order = await Product.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // update order
    order.assignedEmployee = employeeId;
    employee.assignedOrder = orderId;
    order.orderStatus = "ASSIGNED";
    order.assignedAt = new Date();
    await order.save();

    await employee.save();

    res.json({
      success: true,
      message: "Order assigned successfully",
      order,
      employee,
    });
  } catch (err) {
    console.error("❌ Assign Order Error:", err);
    res.status(500).json({ error: "Failed to assign order" });
  }
};

export const getEmployeeOrders = async (req, res) => {
  try {
    const employeeId = req.user.userId; // employee logged in
    console.log(employeeId, "employeeId");
    const orders = await Product.find({ assignedEmployee: employeeId })
      .populate("vendorId")

      .sort({ createdAt: -1 });

    console.log(orders, "orders");

    // const formattedOrders = orders.map((order) => ({
    //   _id: order._id,
    //   id: order.orderId,
    //   assignedAt: order.assignedAt,
    //   paymentMethod: order.paymentMethod,
    //   paymentId: order.paymentId,
    //   orderStatus: order.orderStatus,
    //   customer: order.userId?.userName || "N/A",
    //   phone: order.userId?.mobile || "N/A",
    //   // service: order.cartId?.items.map((i) => i.item).join(", ") || "N/A",
    //   service:
    //     order.cartId?.items.map((i) => `${i.item} x ${i.qty}`).join(", ") ||
    //     "NA",

    //   qty: order.cartId?.items.map((i) => i.qty) || 0,
    //   items: order.cartId?.items?.length || 0,
    //   amount: `₹${order.cartId?.totalPrice || 0}`,
    //   status: order.orderStatus || "pending",
    //   pickupImage: order.pickupImage,
    //   deliveryImage: order.deliveryImage,
    //   pickedAt: order.pickedAt,
    //   pickupId: order.pickupId,
    //   deliveryId: order.deliveryId,
    //   deliveredAt: order.deliveredAt,
    //   lat: order?.userId?.lat || 0,
    //   lng: order?.userId?.lng || 0,
    //   date: order.createdAt.toISOString().split("T")[0],
    //   address: `${order.userId?.hno || ""}, ${order.userId?.street || ""}, ${
    //     order.userId?.area || ""
    //   }, ${order.userId?.state || ""}, ${order.userId?.pincode || ""}`,
    //   employee: {
    //     _id: employeeId,
    //   },
    // }));

    res.json({ success: true, orders });
  } catch (err) {
    console.error("❌ Fetch Employee Orders Error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// export const createProduct = async (req, res, next) => {
//   try {
//     const validationError = createProductValidation(req.body);
//     if (validationError?.errorArray?.length > 0) {
//       return res
//         .status(STATUSCODE.FAILURE)
//         .json({ message: validationError.errorArray[0] });
//     }

//     console.log(req.file, "req.file");

//     if (!req.file) {
//       return res
//         .status(STATUSCODE.FAILURE)
//         .json({ message: "Image is required" });
//     }

//     console.log(req?.file?.location, "url");

//     const imagePath = req.file ? req.file.location : null;

//     console.log(imagePath, "imagePath");

//     const product = new Product({ ...req.body, image: imagePath });
//     console.log(product, "product");
//     await product.save();
//     res.status(201).json(product);
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };

// export const createProduct = async (req, res, next) => {
//   try {
//     const validationError = createProductValidation(req.body);
//     if (validationError?.errorArray?.length > 0) {
//       return res
//         .status(STATUSCODE.FAILURE)
//         .json({ message: validationError.errorArray[0] });
//     }

//     if (
//       (!req.files?.images || req.files.images.length === 0) &&
//       (!req.files?.videos || req.files.videos.length === 0)
//     ) {
//       return res
//         .status(STATUSCODE.FAILURE)
//         .json({ message: "At least one image or video is required" });
//     }

//     const imagePaths = req.files?.images?.map(file => file.location) || [];
//     const videoPaths = req.files?.videos?.map(file => file.location) || [];

//     const product = new Product({
//       ...req.body,
//       images: imagePaths,
//       videos: videoPaths,
//       vandorId: req.user._id,
//     });

//     await product.save();
//     res.status(201).json(product);
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };

export const updateProduct = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "product id is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    console.log("Updating Product:", req.params.id, req.body);

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      product,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    if (!req.params.id) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "product id is required" });
    }
    const product = await Product.findByIdAndDelete(req?.params?.id);
    if (!product) {
      return res.status(STATUSCODE?.NO_DATA).json({ message: "No Data found" });
    }
    res.status(200).json({ message: "product deleted successfully" });
    console.log("product deleted successfully");
  } catch (error) {
    console.log(error);
    next(error);
  }
};
