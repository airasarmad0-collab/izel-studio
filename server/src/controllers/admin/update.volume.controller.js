const VolumeModel = require("../../models/client/volume.schema");
const {
  SERVER_ERROR,
  BAD_REQUEST,
  OK,
} = require("../../config/get.codes");

const mongoose = require("mongoose");

const updateVolume = async (req, res) => {
  try {
    const { volumeId } = req.params;

    const {
      name,
      description,
      tags,
      metaTitle,
      metaDescription,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(volumeId)) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Invalid MongoDB ID!",
        err: "ID_IS_INVALID",
        status: BAD_REQUEST,
      });
    }

    const volume = await VolumeModel.findById(volumeId);

    if (!volume) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Volume not found!",
        err: "NOT_FOUND",
        status: BAD_REQUEST,
      });
    }

    if (name?.trim()) {
      volume.name = name;
    }

    if (description?.trim()) {
      volume.description = description;
    }

    if (metaTitle?.trim()) {
      volume.metaTitle = metaTitle;
    }

    if (metaDescription?.trim()) {
      volume.metaDescription = metaDescription;
    }

    if (Array.isArray(tags)) {
      volume.tags = tags;
    }

    const updatedVolume = await volume.save();

    return res.status(OK).json({
      success: true,
      message: "Volume updated successfully!",
      data: updatedVolume,
      status: OK,
    });

  } catch (err) {

    if (err.code === 11000) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Volume name already exists!",
        status: BAD_REQUEST,
      });
    }

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(
        (error) => error.message
      );

      return res.status(BAD_REQUEST).json({
        success: false,
        message: errors[0],
        errors,
        status: BAD_REQUEST,
      });
    }

    return res.status(SERVER_ERROR).json({
      success: false,
      message: "Server error!",
      err: `SERVER_ERROR:${err.message}`,
      status: SERVER_ERROR,
    });
  }
};

module.exports = updateVolume;