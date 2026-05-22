const { SERVER_ERROR, OK } = require("../../config/get.codes");
const ProductModel = require("../../models/client/product.schema");
const VolumeModel = require("../../models/client/volume.schema");

const appStats = async (req, res) => {
  try {
    let productCount = await ProductModel.countDocuments();
    let volumeCount = await VolumeModel.countDocuments();

    return res.status(OK).json({
      success: true,
      message: "App stats successfully sent!",
      data: {
        productCount: productCount,
        volumeCount: volumeCount,
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

module.exports = appStats;
