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
      mainImage,
      imageGallery,
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

    if (name) product.name = name;
    if (description) product.description = description;
    if (tags) product.tags = tags;
    if (price !== undefined) product.price = price;
    if (mainImage) product.mainImage = mainImage;
    if (imageGallery) product.imageGallery = imageGallery;
    if (purchasingLink) product.purchasingLink = purchasingLink;
    if (type) product.type = type;
    if (metaTitle) product.metaTitle = metaTitle;
    if (metaDescription) product.metaDescription = metaDescription;

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
