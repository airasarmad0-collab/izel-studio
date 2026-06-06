const mongoose = require("mongoose");
const ProductModel = require("../../models/client/product.schema");
const VolumeModel = require("../../models/client/volume.schema");
const { OK, BAD_REQUEST, SERVER_ERROR } = require("../../config/get.codes");

const createProduct = async (req, res) => {
  try {
    const { volumeId } = req.params;

    const {
      name,
      description,
      price,
      purchasingLink,
      type,
      metaTitle,
      metaDescription,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(volumeId)) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Invalid Volume ID!",
      });
    }

    const volume = await VolumeModel.findById(volumeId);
    if (!volume) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Volume not found!",
      });
    }

    // ✅ CLOUDINARY FIX
    const mainImage = req.files?.mainImage?.[0]?.path || null;

    const gallery =
      req.files?.imageGallery?.map((file) => file.path) || [];

    if (!name || !price || !mainImage || !metaTitle) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "name, price, mainImage, metaTitle required",
      });
    }

    const product = await ProductModel.create({
      name,
      description,
      price,
      purchasingLink,
      type,
      metaTitle,
      metaDescription,
      volume: volumeId,

      // ✅ Cloudinary URLs (NO LOCAL DISK)
      mainImage: mainImage,
      imageGallery: gallery,
    });

    return res.status(OK).json({
      success: true,
      message: "Product created successfully!",
      data: product,
    });

  } catch (err) {
    console.log(err);
    return res.status(SERVER_ERROR).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = createProduct;