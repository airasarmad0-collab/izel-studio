const mongoose = require("mongoose");
const ProductModel = require("../../models/client/product.schema");
const VolumeModel = require("../../models/client/volume.schema");
const { OK, BAD_REQUEST, SERVER_ERROR } = require("../../config/get.codes");

const getProductsByVolume = async (req, res) => {
  try {
    const { volumeId } = req.params;
    const page = Number(req.query.page) || 1;
    const search = req.query.search?.trim() || "";
    const limit = 10;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(volumeId)) {
      return res.status(BAD_REQUEST).json({ success: false, message: "Invalid Volume ID!" });
    }

    const filter = { volume: volumeId };
    if (search) filter.name = new RegExp(search, "i");

    const projection = {
      name: 1,
      price: 1,
      mainImage: 1,
      imageGallery: 1,
      metaTitle: 1,
      createdAt: 1,
      description: 1,
      purchasingLink: 1,
      type: 1,
    };

    const [volume, products, totalProducts] = await Promise.all([
      VolumeModel.findById(volumeId).lean(),
      ProductModel.find(filter, projection).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ProductModel.countDocuments(filter),
    ]);

    if (!volume) {
      return res.status(BAD_REQUEST).json({ success: false, message: "Volume not found!" });
    }

    // 🔥 FIX: always convert relative → full URL safely
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const formatUrl = (path) => {
      if (!path) return null;
      if (path.startsWith("http")) return path;
      return `${baseUrl}${path.startsWith("/") ? path : "/" + path}`;
    };

    const productsWithUrls = products.map((p) => ({
      ...p,
      mainImage: formatUrl(p.mainImage),
      imageGallery: (p.imageGallery || []).map(formatUrl),
    }));

    return res.status(OK).json({
      success: true,
      message: "Products fetched successfully!",
      volume,
      data: productsWithUrls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
        limit,
      },
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

module.exports = getProductsByVolume;