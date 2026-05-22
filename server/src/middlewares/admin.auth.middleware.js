const jwt = require("jsonwebtoken");
const { UNAUTHORIZED } = require("../config/get.codes");
const { jwtSecret } = require("../config/env.secrets");

const adminAuth = (req, res, next) => {
  try {
    const token =
      req.cookies?.AdminAuthToken ||
      req.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res.status(UNAUTHORIZED).json({
        success: false,
        message: "No token provided. Access denied!",
        err: "NO_TOKEN",
        status: UNAUTHORIZED,
      });
    }

    const decoded = jwt.verify(token, jwtSecret);

    if (!decoded) {
      return res.status(UNAUTHORIZED).json({
        success: false,
        message: "Invalid token!",
        err: "INVALID_TOKEN",
        status: UNAUTHORIZED,
      });
    }

    if (!decoded._id || !decoded.name || !decoded.email) {
      return res.status(UNAUTHORIZED).json({
        success: false,
        message: "Not authorized as admin!",
        err: "NOT_ADMIN",
        status: UNAUTHORIZED,
      });
    }

    req.admin = decoded;

    next();

  } catch (err) {
    return res.status(UNAUTHORIZED).json({
      success: false,
      message: "Authentication failed!",
      err: err.message,
      status: UNAUTHORIZED,
    });
  }
};

module.exports = adminAuth;