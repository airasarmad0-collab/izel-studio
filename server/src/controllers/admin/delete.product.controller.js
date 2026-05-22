const mongoose = require("mongoose");
const ProductModel = require("../../models/client/product.schema");
const { OK, BAD_REQUEST, SERVER_ERROR } = require("../../config/get.codes");

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Invalid Product ID!",
        status: BAD_REQUEST
      });
    }

    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Product not found!",
        status: BAD_REQUEST
      });
    }

    await ProductModel.findByIdAndDelete(productId);

    return res.status(OK).json({
      success: true,
      message: "Product deleted successfully!",
      status: OK
    });

  } catch (err) {
    console.log(err);

    return res.status(SERVER_ERROR).json({
      success: false,
      message: "Server error!",
      error: err.message,
      status: SERVER_ERROR
    });
  }
};

module.exports = deleteProduct;