import jwt from "jsonwebtoken";
import { STATUSCODE } from "../utils/constants.js";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader, "authHeader");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    console.log(token, "token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res
        .status(STATUSCODE.FAILURE)
        .json({ error: "Please login again" });
    }
    console.log(decoded, "decoded");
    req.user = {
      userId: decoded.userId || decoded.employeeId,
      roleType: decoded.roleType,
    };
    req.admin = decoded.userId;
    req.employee = decoded.userId;
    req.role = decoded.roleType;
    next();
  } catch (err) {
    res.status(STATUSCODE.FAILURE).json({ error: "Token invalid" });
  }
};
