


const VolumeModel = require("../../models/client/volume.schema");
const { SERVER_ERROR, OK } = require("../../config/get.codes");
const NodeCache = require('node-cache');

// Cache with 1 hour TTL (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

const getAllVolumes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";

    // Create a unique cache key based on page and search
    const cacheKey = `volumes_${page}_${search}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      // Cached response – extremely fast (<1ms)
      return res.status(OK).json(cachedData);
    }

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

    // Use lean() for raw JSON (much faster than Mongoose documents)
    const [volumes, totalVolumes] = await Promise.all([
      VolumeModel.find(searchFilter)
        .select("name description tags metaTitle metaDescription createdAt") // select only needed fields
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      VolumeModel.countDocuments(searchFilter)
    ]);

    const totalPages = Math.ceil(totalVolumes / limit);

    const responseData = {
      success: true,
      message: "Volumes fetched successfully!",
      data: volumes,
      pagination: {
        currentPage: page,
        totalPages,
        totalVolumes,
        limit,
      },
    };

    // Store in cache
    cache.set(cacheKey, responseData);

    return res.status(OK).json(responseData);
  } catch (err) {
    console.error("getAllVolumes error:", err);
    return res.status(SERVER_ERROR).json({
      success: false,
      message: "Server error!",
      err: `SERVER_ERROR:${err.message}`,
    });
  }
};

module.exports = getAllVolumes;