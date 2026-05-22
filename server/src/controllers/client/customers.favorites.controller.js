const ProductModel = require("../../models/client/product.schema");
const { OK, SERVER_ERROR } = require("../../config/get.codes");

const customerFavourites = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 9, 20);
    
    const products = await ProductModel.find()
      .select("name price mainImage imageGallery metaTitle createdAt volume")
      .populate("volume", "name")
      .sort({ createdAt: -1 })
      // .skip(9)
      .limit(limit)
      .lean();
    
    const optimizedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      mainImage: product.mainImage,
      galleryImage: product.imageGallery?.[0] || null,
      metaTitle: product.metaTitle,
      createdAt: product.createdAt,
      volume: product.volume?.name || null,
    }));
    
    const responseData = {
      success: true,
      message: "Customer favourite products fetched successfully!",
      data: optimizedProducts,
    };
    
    const sizeKB = (JSON.stringify(responseData).length / 1024).toFixed(2);
    console.log(`✅ Favourites: ${sizeKB} KB (${products.length} products)`);
    
    return res.status(OK).json(responseData);
  } catch (err) {
    console.error("Error:", err);
    return res.status(SERVER_ERROR).json({ success: false, message: "Server error" });
  }
};

module.exports = customerFavourites;