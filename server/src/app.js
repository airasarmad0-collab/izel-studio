const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");

app.use(cookieParser());

app.use(cors({
  origin: [
    "https://izelstudio.store",
    "https://www.izelstudio.store",
    "https://izel-studio.vercel.app",
  ],
  credentials: true
}));
app.set('trust proxy', 1); 

app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));
require("dotenv").config();

// Api's endpoints: 

// requiring rAoutes for api's endpoints: 
const AdminAuthRouter = require("./auth/auth.route");
const AdminFunctionRouter = require("./routes/admin/admin.route");
const ClientFunctionRouter = require("./routes/client/client.route");

const rateLimit = require('express-rate-limit');

// General rate limit
// const limiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minute
//   max: 300, // 30 requests per minute
//   message: 'Too many requests, please try again later.',
// });

// Stricter limit for volumes endpoint
const volumesLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300, // Only 5 requests per minute for volumes
  message: 'Too many volume requests',
});

const compression = require('compression');

// Enable gzip compression
app.use(compression({
  level: 9, // Maximum compression
  threshold: 0, // Compress everything
  filter: (req, res) => {
    // Compress all JSON responses
    return true;
  }
}));

// admin auth api's: 
app.use("/api/admin/auth" , AdminAuthRouter);

// admin function api's: 
app.use("/api/admin" , AdminFunctionRouter);

// client function api's: 
app.use("/api/client" , volumesLimiter , ClientFunctionRouter);

module.exports = app;
