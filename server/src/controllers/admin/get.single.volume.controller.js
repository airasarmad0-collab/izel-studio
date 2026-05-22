const VolumeModel = require("../../models/client/volume.schema");
const { OK, BAD_REQUEST, SERVER_ERROR } = require("../../config/get.codes");
const mongoose = require("mongoose");

const getVolumeById = async (req, res) => {
  try {
    const { volumeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(volumeId)) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const volume = await VolumeModel.findById(volumeId);

    if (!volume) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Volume not found",
      });
    }

    return res.status(OK).json({
      success: true,
      data: volume,
    });

  } catch (err) {
    return res.status(SERVER_ERROR).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = getVolumeById;