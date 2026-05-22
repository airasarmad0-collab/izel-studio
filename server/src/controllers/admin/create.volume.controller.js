const {
  SERVER_ERROR,
  BAD_REQUEST,
  OK,
} = require("../../config/get.codes");

const VolumeModel = require("../../models/client/volume.schema");

const createVolume = async (req, res) => {
  try {
    const {
      name,
      description,
      tags,
      metaTitle,
      metaDescription,
    } = req.body;

    // Required validations
    if (!name) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Name is required!",
        status: BAD_REQUEST,
      });
    }

    if (!metaTitle) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Meta Title is required!",
        status: BAD_REQUEST,
      });
    }

    // Create object dynamically
    const volumeData = {
      name,
      metaTitle,
    };

    // Optional fields
    if (description?.trim()) {
      volumeData.description = description;
    }

    if (metaDescription?.trim()) {
      volumeData.metaDescription = metaDescription;
    }

    if (Array.isArray(tags) && tags.length > 0) {
      volumeData.tags = tags;
    }

    const volume = await VolumeModel.create(volumeData);

    return res.status(OK).json({
      success: true,
      message: "Volume created successfully!",
      data: volume,
      status: OK,
    });

  } catch (err) {

    // Handle duplicate volume name
    if (err.code === 11000) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Volume name already exists!",
        status: BAD_REQUEST,
      });
    }

    // Handle mongoose validation errors
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
      err: `SERVER_ERROR: ${err.message}`,
      status: SERVER_ERROR,
    });
  }
};

module.exports = createVolume;