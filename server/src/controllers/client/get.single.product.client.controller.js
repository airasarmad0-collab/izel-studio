const mongoose = require("mongoose");
const ProductModel = require("../../models/client/product.schema");
const { OK, BAD_REQUEST, SERVER_ERROR, NOT_FOUND } = require("../../config/get.codes");
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const getSingleProductByIdClient = async (req, res) => {
  try {
    const { productId } = req.params;

    // Better validation with clear error message
    if (!productId || productId.length === 0) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Product ID is required",
        status: BAD_REQUEST,
      });
    }

    // Check if ID is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log(`Invalid ObjectId received: ${productId} (length: ${productId.length})`);
      return res.status(BAD_REQUEST).json({
        success: false,
        message: `Invalid Product ID format. Expected 24 character hex string, got ${productId.length} characters.`,
        status: BAD_REQUEST,
      });
    }

    // Check cache
    const cacheKey = `product_${productId}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(OK).json(cachedData);
    }

    // Fetch product
    const product = await ProductModel.findById(productId)
      .populate({
        path: "volume",
        select: "name description metaTitle metaDescription tags",
        options: { lean: true }
      })
      .lean();

    if (!product) {
      return res.status(NOT_FOUND || 404).json({
        success: false,
        message: "Product not found!",
        status: NOT_FOUND || 404,
      });
    }

    // Fetch related products
    const volumeId = product.volume?._id || product.volume;
    let relatedProducts = [];
    
    if (volumeId) {
      relatedProducts = await ProductModel.find({
        volume: volumeId,
        _id: { $ne: product._id }
      })
        .select("name price mainImage imageGallery metaTitle createdAt")
        .limit(4)
        .sort({ createdAt: -1 })
        .lean();
    }

    const responseData = {
      success: true,
      message: "Product fetched successfully!",
      data: product,
      relatedProducts: relatedProducts,
      status: OK,
    };

    // Cache the response
    cache.set(cacheKey, responseData);

    return res.status(OK).json(responseData);

  } catch (err) {
    console.error("Error in getSingleProductByIdClient:", err);
    return res.status(SERVER_ERROR).json({
      success: false,
      message: "Server error!",
      error: err.message,
      status: SERVER_ERROR,
    });
  }
};

module.exports = getSingleProductByIdClient;