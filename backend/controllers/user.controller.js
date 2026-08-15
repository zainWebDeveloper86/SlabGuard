import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import sendToken from "../utils/jwtToken.js";

// =============================================
// Register a new user
// =============================================
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { username, email, password, fullName, role } = req.body;

  if (!username || !email || !password || !fullName) {
    return next(
      new ErrorHandler(
        "All fields (username, email, password, fullName) are required",
        400,
      ),
    );
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return next(new ErrorHandler("Username or email already exists", 400));
  }

  const newUser = await User.create({
    username,
    email,
    password,
    fullName,
    role: role || "user",
  });

  res.status(201).json({
    success: true,
    message: "Account Registered Successfully!",
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
    },
  });
});

// =============================================
// Login user
// =============================================
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { usernameOREmail, password, rememberMe } = req.body;

  if (!usernameOREmail || !password) {
    return next(
      new ErrorHandler("Username/Email and password are required", 400),
    );
  }

  const user = await User.findOne({
    $or: [{ username: usernameOREmail }, { email: usernameOREmail }],
  });

  if (!user) {
    return next(new ErrorHandler("Invalid username/email or password", 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid username/email or password", 401));
  }

  sendToken(user, 200, res, { rememberMe });
});

// =============================================
// Get login user
// =============================================
export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await Users.findById(req.user._id).select("-password");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({ success: true, user });
});

// =============================================
// logout user
// =============================================
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out Successfully!" });
});
