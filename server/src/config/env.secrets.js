const mongoUri = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT;

if (!mongoUri || !jwtSecret || !port) {
    throw new Error("Missing ENV variables");
}

module.exports = {
    mongoUri,
    jwtSecret,
    port
};