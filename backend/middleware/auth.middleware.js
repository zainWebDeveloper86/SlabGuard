import jwt from "jsonwebtoken";
import catchAsyncErrors from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import User from "../models/user.model.js";

// for normal user
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.userId).select("-password");
  // console.log(decoded);

  if (!req.user) {
    return next(new ErrorHandler("Invalid token. User not found.", 401));
  }

  next();
});

// for Admin
export const isAdmin = catchAsyncErrors(async (req, res, next) => {
  if (!req.user) {
    return next(new ErrorHandler("Please login first", 401));
  }

  if (req.user.role !== "admin") {
    return next(new ErrorHandler("Access denied. Admin only.", 403));
  }

  next();
});