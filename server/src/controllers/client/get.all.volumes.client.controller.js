const VolumeModel = require("../../models/client/volume.schema");
const { SERVER_ERROR, OK } = require("../../config/get.codes");

const getAllVolumesClient = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";

    const limit = 10;
    const skip = (page - 1) * limit;

    const searchFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { tags: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const volumes = await VolumeModel.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalVolumes = await VolumeModel.countDocuments(searchFilter);

    const totalPages = Math.ceil(totalVolumes / limit);

    return res.status(OK).json({
      success: true,
      message: "Volumes fetched successfully!",
      data: volumes,
      pagination: {
        currentPage: page,
        totalPages,
        totalVolumes,
        limit,
      },
    });

  } catch (err) {
    return res.status(SERVER_ERROR).json({
      success: false,
      message: "Server error!",
      err: `SERVER_ERROR:${err.message}`,
    });
  }
};

module.exports = getAllVolumesClient;
