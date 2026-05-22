const { OK, UNAUTHORIZED } = require("../../config/get.codes");

const adminDetails = async (req, res) => {
  try {
    const admin = req.admin;

    if (!admin) {
      return res.status(UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized access!",
        err: "NO_ADMIN_FOUND",
        status: UNAUTHORIZED,
      });
    }

    return res.status(OK).json({
      success: true,
      message: "Admin details fetched successfully!",
      data: {
        name: admin.name,
        email: admin.email,
      },
      status: OK,
    });

  } catch (err) {
    return res.status(UNAUTHORIZED).json({
      success: false,
      message: "Failed to fetch admin details!",
      err: err.message,
      status: UNAUTHORIZED,
    });
  }
};

module.exports = adminDetails;