const mongoose = require("mongoose");
const ProductModel = require("../../models/client/product.schema");
const VolumeModel = require("../../models/client/volume.schema");
const { OK, BAD_REQUEST, SERVER_ERROR } = require("../../config/get.codes");

const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const {
      name,
      description,
      tags,
      price,
      purchasingLink,
      type,
      volume,
      metaTitle,
      metaDescription,
    } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Invalid Product ID!",
      });
    }

    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Product not found!",
      });
    }

    // Check volume
    if (volume) {
      const volumeExists = await VolumeModel.findById(volume);

      if (!volumeExists) {
        return res.status(BAD_REQUEST).json({
          success: false,
          message: "Volume not found!",
        });
      }

      product.volume = volume;
    }

    // Text fields update
    if (name) product.name = name;
    if (description) product.description = description;
    if (tags) product.tags = tags;
    if (price !== undefined) product.price = price;
    if (purchasingLink) product.purchasingLink = purchasingLink;
    if (type) product.type = type;
    if (metaTitle) product.metaTitle = metaTitle;
    if (metaDescription) product.metaDescription = metaDescription;

    // 🔥 IMAGE HANDLING (IMPORTANT FIX)
    const mainImageFile = req.files?.mainImage?.[0]?.filename;
    const galleryFiles = req.files?.imageGallery?.map(f => f.filename);

    const BASE_URL = "https://izel-studio.onrender.com/uploads/products/";

    if (mainImageFile) {
      product.mainImage = BASE_URL + mainImageFile;
    }

    if (galleryFiles && galleryFiles.length > 0) {
      product.imageGallery = galleryFiles.map(img => BASE_URL + img);
    }

    const updatedProduct = await product.save();

    return res.status(OK).json({
      success: true,
      message: "Product updated successfully!",
      data: updatedProduct,
    });

  } catch (err) {
    console.log(err);

    if (err.code === 11000) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Product name already exists!",
      });
    }

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);

      return res.status(BAD_REQUEST).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    return res.status(SERVER_ERROR).json({
      success: false,
      message: "Server error!",
      error: err.message,
    });
  }
};

module.exports = updateProduct;