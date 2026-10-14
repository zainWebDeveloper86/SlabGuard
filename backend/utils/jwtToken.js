import jwt from "jsonwebtoken";

// create token and saving that in cookies
const sendToken = (user, statusCode, res, options = {}) => {
  const { cookieName = "token", rememberMe = false } = options;
  const expiresIn = rememberMe ? "7d" : "1d";

  const token = jwt.sign(
    { userId: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn },
  );

  const cookieExpiryDays = rememberMe ? 7 : 1;

  const isProduction = process.env.NODE_ENV === "production";

  // Options for cookies
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiryDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  };

  // strip/remove password before sending user object back
  const userObj = user.toObject();
  delete userObj.password;

  res.status(statusCode).cookie(cookieName, token, cookieOptions).json({
    success: true,
    user: userObj,
  });
};

export default sendToken;
