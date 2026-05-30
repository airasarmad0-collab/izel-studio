const http = require("http");
const app = require("./src/app");
const dbConnection = require("./src/config/db.connection");
const express = require("express");
const path = require("path")

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

const port = process.env.PORT || 5000;
const server = http.createServer(app);

const startServer = async () => {
    try {
        await dbConnection(); 

        server.listen(port, () => {
            console.log(`Server running at port: ${port}`);
        });

    } catch (err) {
        console.error("Server failed to start:", err.message);
        process.exit(1);
    }
};

startServer();