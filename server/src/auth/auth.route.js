const express = require("express");
const AdminAuthRouter = express.Router();4

// Requiring functions for api's: 

const adminSignup = require("../controllers/auth/admin.signup.controller");
const adminLogin = require("../controllers/auth/admin.login.controller");
const adminLogout = require("../controllers/auth/admin.logout.controller");
const adminCount = require("../controllers/auth/admin.count.controller");

// Signup api: /api/admin/auth/signup , method = post
AdminAuthRouter.post("/signup" , adminSignup);

// Login api: /api/admin/auth/login , method = post
AdminAuthRouter.post("/login" , adminLogin);

// Logout api: /api/admin/auth/logout , method = post
AdminAuthRouter.post("/logout" , adminLogout);

// Admin Count api: /api/admin/auth/count , method = get
AdminAuthRouter.get("/count" , adminCount);

module.exports = AdminAuthRouter;