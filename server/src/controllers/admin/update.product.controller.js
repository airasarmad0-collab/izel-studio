const mongoose = require("mongoose");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary"); // adjust path to your cloudinary.js
const ProductModel = require("../../models/client/product.schema");
const VolumeModel = require("../../models/client/volume.schema");
const { OK, BAD_REQUEST, SERVER_ERROR } = require("../../config/get.codes");

// ─────────────────────────────────────────────────────────────────
// 1. Configure multer with Cloudinary storage (same as your existing upload.js)
// ─────────────────────────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "izel-studio/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// This multer middleware handles fields:
//   - mainImage (single)
//   - imageGallery (multiple, up to 9)
const uploadProductFiles = upload.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "imageGallery", maxCount: 9 },
]);

// ─────────────────────────────────────────────────────────────────
// 2. Helper to run multer middleware inside the controller
// ─────────────────────────────────────────────────────────────────
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
};

// ─────────────────────────────────────────────────────────────────
// 3. Main update controller
// ─────────────────────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    // Run multer file parsing first
    await runMiddleware(req, res, uploadProductFiles);

    const { productId } = req.params;

    // Text fields from body
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
      existingMainImage,      // sent from frontend to keep old URL if no new file
      existingImageGallery,   // array of existing gallery URLs (as JSON string or array)
    } = req.body;

    // Uploaded files
    const uploadedMain = req.files?.mainImage?.[0];
    const uploadedGallery = req.files?.imageGallery || [];

    // Validate productId
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

    // Required fields
    if (!name || !price || !metaTitle) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Please provide name, price, and metaTitle",
      });
    }

    // ─── Main Image Logic ─────────────────────────────────────
    let mainImageUrl = product.mainImage;
    if (uploadedMain) {
      // New file uploaded → use Cloudinary URL
      mainImageUrl = uploadedMain.path;
    } else if (existingMainImage) {
      // No new file, keep existing (sent from frontend)
      mainImageUrl = existingMainImage;
    }
    if (!mainImageUrl) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Main image is required",
      });
    }

    // ─── Gallery Images Logic ─────────────────────────────────
    let galleryUrls = [];

    // Parse existing gallery (sent as JSON string or array)
    if (existingImageGallery) {
      try {
        galleryUrls = Array.isArray(existingImageGallery)
          ? existingImageGallery
          : JSON.parse(existingImageGallery);
      } catch (e) {
        galleryUrls = [];
      }
    } else if (product.imageGallery && product.imageGallery.length) {
      galleryUrls = [...product.imageGallery];
    }

    // Append new uploaded gallery images
    for (const file of uploadedGallery) {
      galleryUrls.push(file.path);
    }

    // Remove duplicates and empty strings
    galleryUrls = [...new Set(galleryUrls)].filter(url => url && url.trim());

    // ─── Volume check (if changed) ────────────────────────────
    if (volume && volume !== product.volume?.toString()) {
      const volumeExists = await VolumeModel.findById(volume);
      if (!volumeExists) {
        return res.status(BAD_REQUEST).json({
          success: false,
          message: "Volume not found!",
        });
      }
      product.volume = volume;
    }

    // ─── Update text fields ───────────────────────────────────
    product.name = name;
    if (description !== undefined) product.description = description;
    if (tags && Array.isArray(tags)) {
      product.tags = tags.filter(tag => tag && tag.trim());
    }
    product.price = price;
    if (purchasingLink !== undefined) product.purchasingLink = purchasingLink;
    if (type !== undefined) product.type = type;
    if (metaTitle !== undefined) product.metaTitle = metaTitle;
    if (metaDescription !== undefined) product.metaDescription = metaDescription;

    // Update images
    product.mainImage = mainImageUrl;
    product.imageGallery = galleryUrls;

    const updatedProduct = await product.save();

    return res.status(OK).json({
      success: true,
      message: "Product updated successfully!",
      data: updatedProduct,
    });

  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Product name already exists!",
      });
    }
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message);
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