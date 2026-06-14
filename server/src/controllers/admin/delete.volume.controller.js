const VolumeModel = require("../../models/client/volume.schema");
const ProductModel = require("../../models/client/product.schema");
const { SERVER_ERROR, BAD_REQUEST, OK } = require("../../config/get.codes");
const mongoose = require("mongoose");

const deleteVolume = async (req, res) => {
  try {
    const { volumeId } = req.params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(volumeId)) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Invalid MongoDB ID",
        err: "ID_IS_INVALID",
        status: BAD_REQUEST,
      });
    }

    // Check volume exists
    const volume = await VolumeModel.findById(volumeId);

    if (!volume) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Volume not found!",
        err: "NOT_FOUND",
        status: BAD_REQUEST,
      });
    }

    // ✅ Delete all products of this volume
    await ProductModel.deleteMany({
      volume: volumeId,
    });

    // ✅ Delete volume
    await VolumeModel.findByIdAndDelete(volumeId);

    return res.status(OK).json({
      success: true,
      message: "Volume and related products deleted successfully!",
      data: volume,
      status: OK,
    });

  } catch (err) {
    return res.status(SERVER_ERROR).json({
      success: false,
      message: "Server error!",
      err: `SERVER_ERROR:${err.message}`,
      status: SERVER_ERROR,
    });
  }
};

module.exports = deleteVolume;