const rateLimit = require("express-rate-limit");

const apiReqLimit = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 150,                  
  message: {
    success: false,
    message: "Too many requests. Try again after 1 hour.",
    err: "API_RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,     
  legacyHeaders: false,      
});

module.exports = apiReqLimit;