const ProductModel = require("../../models/client/product.schema");
const { OK, SERVER_ERROR } = require("../../config/get.codes");

const latestProducts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 9, 20);
    
    const products = await ProductModel.find()
      .select("name price mainImage imageGallery metaTitle createdAt volume")
      .populate("volume", "name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    // Send only the first gallery image (if any)
    const optimizedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      mainImage: product.mainImage,            // relative path, e.g. "/uploads/products/abc.jpg"
      galleryImage: product.imageGallery?.[0] || null,   // first gallery image or null
      metaTitle: product.metaTitle,
      createdAt: product.createdAt,
      volume: product.volume?.name || null,
    }));
    
    const responseData = {
      success: true,
      message: "Latest products fetched successfully!",
      data: optimizedProducts,
    };
    
    const sizeKB = (JSON.stringify(responseData).length / 1024).toFixed(2);
    console.log(`✅ Latest: ${sizeKB} KB (${products.length} products)`);
    if (sizeKB > 500) console.warn(`⚠️ Still large: ${sizeKB} KB – check image URLs in DB`);
    
    return res.status(OK).json(responseData);
  } catch (err) {
    console.error("Error in latestProducts:", err);
    return res.status(SERVER_ERROR).json({ success: false, message: "Server error" });
  }
};

module.exports = latestProducts;