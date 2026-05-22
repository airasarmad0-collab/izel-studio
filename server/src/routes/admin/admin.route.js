const express = require("express");
const AdminFunctionRouter = express.Router();

// Requiring function for api's:
const createVolume = require("../../controllers/admin/create.volume.controller");
const updateVolume = require("../../controllers/admin/update.volume.controller");
const deleteVolume = require("../../controllers/admin/delete.volume.controller");
const createProduct = require("../../controllers/admin/create.product.controller");
const updateProduct = require("../../controllers/admin/update.product.controller");
const deleteProduct = require("../../controllers/admin/delete.product.controller");
const adminDetails = require("../../controllers/admin/admin.details.controller");
const appStats = require("../../controllers/admin/app.stats.controller");
const getAllVolumes = require("../../controllers/admin/get.all.volume.controller");
const getProductsByVolume = require("../../controllers/admin/get.all.products.controller");
const getSingleProductById = require("../../controllers/admin/get.single.product.controller");

// admin auth middleware: 
const adminAuth = require("../../middlewares/admin.auth.middleware");
const getVolumeById = require("../../controllers/admin/get.single.volume.controller");
AdminFunctionRouter.use(adminAuth);

// Create Volume: /api/admin/create/volume , method == post
AdminFunctionRouter.post("/create/volume" , createVolume);

// Updating Volume: /api/admin/update/volume/:volumeId , method == put
AdminFunctionRouter.put("/update/volume/:volumeId" , updateVolume);

// Deleting Volume /api/admin/delete/volume/:volumeId , method == delete
AdminFunctionRouter.delete("/delete/volume/:volumeId" , deleteVolume);

// Create volume: /api/admin/create/product , method == post
const upload = require("../../middlewares/upload.middleware");

AdminFunctionRouter.post(
  "/create/product/:volumeId",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "imageGallery", maxCount: 10 },
  ]),
  createProduct
);

// Updating volume: /api/admin/update/product/:productId , method == put 
AdminFunctionRouter.put("/update/product/:productId" , updateProduct);

// Deleting volume: /api/admin/delete/product/:productId , method == delete
AdminFunctionRouter.delete("/delete/product/:productId" , deleteProduct);

// Admin Details: /api/admin/details , method == get
AdminFunctionRouter.get("/details" , adminDetails);

// App Stats: /api/admin/app/stats , method == get
AdminFunctionRouter.get("/app/stats" , appStats);

// Get All Volumes: /api/admin/get-all/volumes , method == get
AdminFunctionRouter.get("/get-all/volumes" , getAllVolumes);

// Get single volume: /api/admin/get/volume/:volumeId , method == get
AdminFunctionRouter.get("/get/volume/:volumeId" , getVolumeById);

// Get All products: /api/admin/get-all/products , method == get
AdminFunctionRouter.get("/get-all/products/:volumeId" , getProductsByVolume);

// Get Single Product: /api/admin/get/product/:productId , method == get 
AdminFunctionRouter.get("/get/product/:productId" , getSingleProductById);

module.exports = AdminFunctionRouter;