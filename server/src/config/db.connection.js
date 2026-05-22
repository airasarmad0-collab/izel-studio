const mongoose = require("mongoose");
const { mongoUri } = require("./env.secrets");

const dbConnection = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log("DB connected successfully");
    } catch (err) {
        console.error("DB connection failed:", err.message);
        process.exit(1);
    }
};

module.exports = dbConnection;