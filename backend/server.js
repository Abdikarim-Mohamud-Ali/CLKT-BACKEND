
// =====================================================
// CLKT.COM BACKEND SERVER
// =====================================================

const dns = require("dns");

dns.setServers(["8.8.8.8"]);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const cloudinary = require("./config/cloudinary");

const User = require("./models/User");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());

app.use("/api/users", userRoutes);

app.use("/api/posts", postRoutes);

// =====================================================
// CONNECT TO MONGODB
// =====================================================

mongoose.connect(process.env.MONGO_URI)

    .then(function() {

        console.log(
            "Connected to MongoDB successfully."
        );

    })

    .catch(function(error) {

        console.error(
            "MongoDB connection failed:",
            error
        );

    });

// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", function(req, res) {

    res.json({

        message: "CLKT backend is running!"

    });

});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, function() {

    console.log(
        `CLKT backend running on port ${PORT}`
    );

});
