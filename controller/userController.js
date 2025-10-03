import User from "../model/user.js";
import bcrypt from "bcryptjs";
import { STATUSCODE } from "../utils/constants.js";
import { userLoginValidation, userValidation } from "../utils/validation.js";
import jwt from "jsonwebtoken";
import { roleType } from "../utils/roles.js";
import { sendEmail } from "../middlewares/emailer.js";

export const createUser = async (req, res, next) => {
  try {
    const { userName, email,mobile, password } = req.body;

    const validationError = userValidation(req.body);
    if (userValidation.errorArray) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: validationError.errorArray[0] });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      email,
      mobile,
      password: hashedPassword,
    });
    if (!user) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "user not created" });
    }

    const token = jwt.sign(
      { userId: user._id, roleType: roleType.USER },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res
      .status(STATUSCODE.SUCCESS)
      .json({ token, message: "user created successfully" });
  } catch (error) {
    next(error);
  }
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const validationError = userLoginValidation(req.body);

    if (validationError.errorArray) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: validationError.errorArray[0] });
    }

    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(STATUSCODE.FAILURE).json({ message: "user not found" });
    }

    const isMatch = await bcrypt.compare(password, userExists.password);
    if (!isMatch) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "Incorrect Password" });
    }

    const token = jwt.sign(
      { userId: userExists._id, roleType: roleType.USER },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    if (!token) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ message: "token not created" });
    }
    res
      .status(STATUSCODE.SUCCESS)
      .json({ token, message: "user logged in successfully" });
  } catch (error) {
    next(error);
  }
};


export const getUser = async (req, res, next) => {
  try {
    
    const users = await User.find({}).sort({ _id: -1 }) 

    if (!users) {
      return res.status(STATUSCODE.FAILURE).json({ message: "User not found" });
    }

    res
      .status(STATUSCODE.SUCCESS)
      .json({ message: "User fetched successfully", users });
  } catch (error) {
    next(error);
  }
};


export const userForgotPassword = async (req, res, next) => {
  try {
    const { email, password, conformPassword } = req.body;

    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(STATUSCODE.FAILURE).json({ message: "user not found" });
    }

    const generateOtp = Math.floor(1000 + Math.random() * 9000);

    // prepare email
    const subject = 'Your OTP Code';
    const message = `Hi ${userExists.userName || 'User'},\n\nYour OTP code is: ${generateOtp}\nIt will expire in 10 minutes.\n\nThanks,\n`;
    
    const emailSent = await sendEmail(email, subject, message);
    
    if (!emailSent) {
      return res.status(STATUSCODE.FAILURE).json({ message: "Failed to send OTP" });
    }

    // optionally save OTP in DB or cache here

    const otp=await User.findOneAndUpdate({email},{forgotOtp:generateOtp},{new:true});
    if(!otp){
        return res.status(STATUSCODE.FAILURE).json({message:"OTP not created"});
    }

    return res
      .status(STATUSCODE.SUCCESS)
      .json({ message: "OTP sent to email" });

    // if(password!==conformPassword){
    //     return res.status(STATUSCODE.FAILURE).json({message:"Password does not match"});
    // }

    // const hashedPassword=await bcrypt.hash(password,10);
    // const user=await User.findOneAndUpdate({email},{password:hashedPassword},{new:true});
    // if(!user){
    //     return res.status(STATUSCODE.FAILURE).json({message:"user not updated"});
    // }

    // const token=jwt.sign({userId:user._id,roleType:roleType.USER},process.env.JWT_SECRET,{expiresIn:"7d"});
    // if(!token){
    //     return res.status(STATUSCODE.FAILURE).json({message:"token not created"});
    // }
    // res.status(STATUSCODE.SUCCESS).json({token,message:"Password changed successfully"});
  } catch (error) {
    next(error);
  }
};

