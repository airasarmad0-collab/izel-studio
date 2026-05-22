const express = require("express");
const ClientFunctionRouter = express.Router();

// requiring functions for api's routes
const getAllVolumesClient = require("../../controllers/admin/get.all.volume.controller");
const getProductsByVolumeClient = require("../../controllers/client/get.all.products.client.controller");
const getSingleProductByIdClient = require("../../controllers/client/get.single.product.client.controller");
const appStatsClient = require("../../controllers/client/app.stats.client.controller");
const latestProducts = require("../../controllers/client/latest.products.controller");
const customerFavourites = require("../../controllers/client/customers.favorites.controller");

// All volumes: /api/client/get-all/volumes , method == get
ClientFunctionRouter.get("/get-all/volumes" , getAllVolumesClient);

// All products: /api/client/get-all/products/:volumeId , method == get
ClientFunctionRouter.get("/get-all/products/:volumeId" , getProductsByVolumeClient);

// Single product: /api/client/get/product/:productId , method == get
ClientFunctionRouter.get("/get/product/:productId" , getSingleProductByIdClient);

// App stats: /api/client/app/stats , method == get
ClientFunctionRouter.get("/app/stats" , appStatsClient);

// Latest stats: /api/client/latest/products , method == get
ClientFunctionRouter.get("/latest/products" , latestProducts);

// Customers Favorites: /api/client/customers-favorites/products , method == get
ClientFunctionRouter.get("/customers-favorites/products" , customerFavourites);

module.exports = ClientFunctionRouter;