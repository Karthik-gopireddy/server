import express from "express";

import { errorHandler } from "../middlewares/errorHandler.js";
import { createVendor, Login,vendorDetails } from "../controller/vendorCollections.js";

const router = express.Router();

router.post("/register", createVendor);
router.post("/login", Login);


router.get("/getVendorDetails",vendorDetails)



router.use(errorHandler);

export default router;
