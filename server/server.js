const http = require("http");
const app = require("./src/app");
const dbConnection = require("./src/config/db.connection");
const express = require("express");
const path = require("path")
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const port = process.env.PORT;
const server = http.createServer(app);

const startServer = async () => {
    try {
        await dbConnection(); 

        server.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });

    } catch (err) {
        console.error("Server failed to start:", err.message);
        process.exit(1);
    }
};

startServer();