const mongoose = require("mongoose");
const ProductModel = require("../../models/client/product.schema");
const { OK, BAD_REQUEST, SERVER_ERROR } = require("../../config/get.codes");
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // 10 minutes

const getSingleProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Invalid Product ID!",
        status: BAD_REQUEST,
      });
    }

    // Cache check
    const cacheKey = `admin_product_${productId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(OK).json(cached);
    }

    // Fetch product with populated volume (using lean for raw JSON)
    const product = await ProductModel.findById(productId)
      .populate({
        path: "volume",
        select: "name description metaTitle metaDescription tags",
        options: { lean: true },
      })
      .lean();

    if (!product) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Product not found!",
        status: BAD_REQUEST,
      });
    }

    // Fetch related products (same volume, exclude current)
    const relatedProducts = await ProductModel.find({
      volume: product.volume?._id || product.volume,
      _id: { $ne: product._id },
    })
      .select("name price mainImage imageGallery metaTitle createdAt")
      .limit(3)
      .sort({ createdAt: -1 })
      .lean();

    const responseData = {
      success: true,
      message: "Product fetched successfully!",
      data: product,
      relatedProducts,
      status: OK,
    };

    cache.set(cacheKey, responseData);

    return res.status(OK).json(responseData);
  } catch (err) {
    console.error(err);
    return res.status(SERVER_ERROR).json({
      success: false,
      message: "Server error!",
      error: err.message,
      status: SERVER_ERROR,
    });
  }
};

module.exports = getSingleProductById;