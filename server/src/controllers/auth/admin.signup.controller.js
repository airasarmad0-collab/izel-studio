const bcrypt = require("bcrypt");
const AdminAccountModel = require("../../models/admin/admin.account");
const {
  UNAUTHORIZED,
  CONFLICT,
  SERVER_ERROR,
  OK,
} = require("../../config/get.codes");
const { jwtSecret } = require("../../config/env.secrets");
const jwt = require("jsonwebtoken");

const adminSignup = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    let adminCount = await AdminAccountModel.countDocuments();

    if (adminCount >= 3) {
      return res.status(CONFLICT).json({
        success: false,
        message: "Admin limit reached",
        err: "ADMIN_COUNT_FULL",
        status: CONFLICT,
      });
    }

    let existingUser = await AdminAccountModel.findOne({
      $or: [{ name }, { email }],
    });

    if (existingUser) {
      return res.status(CONFLICT).json({
        success: false,
        message: "Admin already exists!",
        err: "ALREADY_EXISTS",
        status: CONFLICT,
      });
    }

    let hash = await bcrypt.hash(password, 10);

    let admin = await AdminAccountModel.create({
      name,
      email,
      password: hash,
    });

    let token = await jwt.sign(
      {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
      },
      jwtSecret,
      {
        expiresIn: "15d",
      },
    );

   res.cookie("AdminAuthToken", token, {
  httpOnly: true,
  secure: true,        // MUST be true in production
  sameSite: "none",    // 🔥 REQUIRED for cross-domain
  maxAge: 15 * 24 * 60 * 60 * 1000,
});

    return res.status(OK).json({
      success: true,
      message: `${admin.name}, account created successfully!`,
      token: token,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
      status: OK,
    });
  } catch (err) {
    return res.status(SERVER_ERROR).json({
      success: false,
      message: "Server error!",
      err: `SERVER_ERROR:${err}`,
      status: SERVER_ERROR,
    });
  }
};

module.exports = adminSignup;
