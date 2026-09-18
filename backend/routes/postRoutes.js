const express = require("express");
const Post = require("../models/Post");

const router = express.Router();

router.post("/", async function(req, res) {

    console.log("Create post request received.");

    try {

        const userId = req.body.userId;
        const type = req.body.type;
        const text = req.body.text;
        const audioUrl = req.body.audioUrl;

        if (!userId) {

            return res.status(400).json({
                message: "User ID is required."
            });

        }

        const post = await Post.create({

            user: userId,

            type: type || "voice",

            text: text || "",

            audioUrl: audioUrl || null

        });

        res.status(201).json({

            message: "Post created successfully.",

            post: post

        });

    } catch (error) {

        console.error("Create post error:", error);

        res.status(500).json({

            message: "Unable to create post."

        });

    }

});

router.get("/", async function(req, res) {

    console.log("Get posts request received.");

    try {

        const posts = await Post.find()
            .populate("user", "name username")
            .sort({ createdAt: -1 });

        res.json({

            posts: posts

        });

    } catch (error) {

        console.error("Get posts error:", error);

        res.status(500).json({

            message: "Unable to load posts."

        });

    }

});

module.exports = router;