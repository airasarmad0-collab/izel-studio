const { OK } = require("../../config/get.codes");
const AdminAccountModel = require("../../models/admin/admin.account");

const adminCount = async (req, res) => {
  try {
    let adminCount = await AdminAccountModel.countDocuments();

    return res.status(OK).json({
      success: true,
      message: "Admin count successfully delivered!",
      count: adminCount,
      status: OK,
    });
  } catch (err) {
    return res.status(SERVER_ERROR).json({
      success: false,
      message: "Logout failed",
      err: err.message,
      status: SERVER_ERROR,
    });
  }
};

module.exports = adminCount;
