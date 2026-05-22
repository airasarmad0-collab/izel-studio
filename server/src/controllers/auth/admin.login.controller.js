const AdminAccountModel = require("../../models/admin/admin.account");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  SERVER_ERROR,
  BAD_REQUEST,
  NOT_FOUND,
  UNAUTHORIZED,
  OK,
} = require("../../config/get.codes");
const { jwtSecret } = require("../../config/env.secrets");

const adminLogin = async (req, res) => {
  try {
    let { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Email and password are required to login",
        err: "MISSING_FIELDS",
        status: BAD_REQUEST
      });
    }

    let admin = await AdminAccountModel.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(NOT_FOUND).json({
        success: false,
        message: "No admin account found with this email",
        err: "ADMIN_NOT_FOUND",
        status: NOT_FOUND
      });
    }

    let match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.status(UNAUTHORIZED).json({
        success: false,
        message: "Incorrect Credentials. Please try again",
        err: "INVALID_CREDENTIALS",
        status: UNAUTHORIZED
      });
    }

    let token = jwt.sign(
      {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
      },
      jwtSecret,
      {
        expiresIn: "15d",
      }
    );

    res.cookie("AdminAuthToken", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    return res.status(OK).json({
      success: true,
      message: `Welcome back, ${admin.name}! Login successful`,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
      token,
      status: OK
    });

  } catch (err) {
    return res.status(SERVER_ERROR).json({
      success: false,
      message: "Internal server error during login",
      err: err.message,
      status: SERVER_ERROR
    });
  }
};

module.exports = adminLogin;