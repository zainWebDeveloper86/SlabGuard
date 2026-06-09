import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Users from "../models/users.model.js";
import process from "process";

// Register a new user
export const register = async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body;

    // Validation
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (username, email, password, fullName) are required",
      });
    }

    // Check if user already exists
    const existingUser = await Users.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new Users({
      username,
      email,
      password: hashedPassword,
      fullName,
      role: role || "user", // default to 'user' if not provided
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Account Registered Successfully!",
      user: {
        id: newUser?._id,
        username: newUser?.username,
        email: newUser?.email,
        fullName: newUser?.fullName,
        role: newUser?.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// Login existing user
export const login = async (req, res) => {
  try {
    const { usernameOREmail, password } = req.body;

    if (!usernameOREmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/Email and password are required",
      });
    }

    // Find user by either username or email
    const user = await Users.findOne({
      $or: [{ username: usernameOREmail }, { email: usernameOREmail }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        meterType: user.meterType,
        referenceNo: user.referenceNo,
        unitTarget: user.unitTarget,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

// Get current user (from token)
export const getMe = async (req, res) => {
  try {
    const user = await Users.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// logout
export const logout = async (req, res) => {
  return res
    .status(200)
    .json({ message: "Logged out Successfully!", success: true });
};
