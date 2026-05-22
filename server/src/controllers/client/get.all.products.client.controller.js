const mongoose = require("mongoose");
const ProductModel = require("../../models/client/product.schema");
const VolumeModel = require("../../models/client/volume.schema");
const { OK, BAD_REQUEST, SERVER_ERROR } = require("../../config/get.codes");

// Simple in‑memory cache with longer TTL (60 seconds)
const cache = new Map();

// Pre‑fetch popular pages on server start (optional but recommended)
const preFetchPopular = async () => {
  // You can define a list of volumeIds that are frequently visited
  const popularVolumes = []; // add your volume IDs here
  for (const volId of popularVolumes) {
    await getProductsByVolumeClient({
      params: { volumeId: volId },
      query: { page: 1 }
    }, null);
  }
};

const getProductsByVolumeClient = async (req, res) => {
  try {
    const { volumeId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || "";

    if (!mongoose.Types.ObjectId.isValid(volumeId)) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Invalid Volume ID!",
      });
    }

    // Longer cache TTL – 60 seconds (products don't change every second)
    const cacheKey = `${volumeId}_${page}_${search}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 60000) {
      return res.status(OK).json(cached.data);
    }

    // Build filter
    const filter = { volume: volumeId };
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Run queries in parallel
    const [products, totalProducts, volume] = await Promise.all([
      ProductModel.find(filter)
        .select("name price mainImage imageGallery metaTitle createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductModel.countDocuments(filter),
      VolumeModel.findById(volumeId)
        .select("name description tags metaTitle metaDescription")
        .lean()
    ]);

    if (!volume) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Volume not found!",
      });
    }

    // Build response (still small, no base64)
    const responseData = {
      success: true,
      message: "Products fetched successfully!",
      volume,
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        limit,
      },
    };

    // Store in cache for 60 seconds
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    return res.status(OK).json(responseData);
  } catch (err) {
    console.error("Error:", err);
    return res.status(SERVER_ERROR).json({
      success: false,
      message: "Server error!",
    });
  }
};

// Pre‑cache the first page of the most popular volume on server start
// Uncomment and add your volumeId(s)
// preFetchPopular();

module.exports = getProductsByVolumeClient;