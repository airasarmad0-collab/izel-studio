const mongoose = require("mongoose");
const ProductModel = require("../../models/client/product.schema");
const { OK, BAD_REQUEST, SERVER_ERROR, NOT_FOUND } = require("../../config/get.codes");
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600, useClones: false });
const pendingRequests = new Map();

const getSingleProductByIdClient = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || productId.length !== 24) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: productId ? `Invalid Product ID format. Expected 24 characters, got ${productId.length}` : "Product ID is required",
        status: BAD_REQUEST,
      });
    }

    const cacheKey = `product_${productId}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(OK).json(cachedData);
    }

    if (pendingRequests.has(productId)) {
      const response = await pendingRequests.get(productId);
      return res.status(OK).json(response);
    }

    const requestPromise = (async () => {
      const product = await ProductModel.findById(productId)
        .select("name price description mainImage imageGallery volume metaTitle metaDescription tags specifications createdAt")
        .populate({
          path: "volume",
          select: "name description metaTitle metaDescription tags",
          options: { lean: true }
        })
        .lean()
        .maxTimeMS(2000);

      if (!product) {
        const error = new Error("NOT_FOUND");
        error.status = NOT_FOUND;
        throw error;
      }

      let relatedProducts = [];
      const volumeId = product.volume?._id || product.volume;
      
      if (volumeId) {
        relatedProducts = await ProductModel.find({
          volume: volumeId,
          _id: { $ne: product._id }
        })
          .select("name price mainImage imageGallery metaTitle createdAt")
          .limit(4)
          .sort({ createdAt: -1 })
          .lean()
          .maxTimeMS(1000);
      }

      const responseData = {
        success: true,
        message: "Product fetched successfully!",
        data: product,
        relatedProducts: relatedProducts,
        status: OK,
      };

      cache.set(cacheKey, responseData);
      return responseData;
    })();

    pendingRequests.set(productId, requestPromise);
    const responseData = await requestPromise;
    pendingRequests.delete(productId);

    return res.status(OK).json(responseData);

  } catch (err) {
    if (pendingRequests.has(req.params.productId)) {
      pendingRequests.delete(req.params.productId);
    }
    
    if (err.status === NOT_FOUND || err.message === "NOT_FOUND") {
      return res.status(NOT_FOUND).json({
        success: false,
        message: "Product not found!",
        status: NOT_FOUND,
      });
    }
    
    console.error("Error in getSingleProductByIdClient:", err);
    return res.status(SERVER_ERROR).json({
      success: false,
      message: "Server error!",
      status: SERVER_ERROR,
    });
  }
};

module.exports = getSingleProductByIdClient;