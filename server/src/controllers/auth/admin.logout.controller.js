const {
  OK,
  SERVER_ERROR
} = require("../../config/get.codes");

const adminLogout = async (req, res) => {
  try {
    res.clearCookie("AdminAuthToken", {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
    });

    return res.status(OK).json({
      success: true,
      message: "Admin logged out successfully",
      status: OK
    });

  } catch (err) {
    return res.status(SERVER_ERROR).json({
      success: false,
      message: "Logout failed",
      err: err.message,
      status: SERVER_ERROR
    });
  }
};

module.exports = adminLogout;