import express from "express";
import { createUser,userLogin,userForgotPassword, getUser } from "../controller/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register",createUser);
router.post("/login",userLogin);
router.get("/getUserDetails",protect,getUser)
router.post("/forgotPassword",userForgotPassword)


export default router;


