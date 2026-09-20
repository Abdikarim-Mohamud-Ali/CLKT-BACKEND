const express = require("express");

const Post = require("../models/Post");

const router = express.Router();


// =====================================================
// CREATE POST
// =====================================================

router.post("/", async function(req, res) {

    console.log("Create post request received.");

    try {

        const userId = req.body.userId;

        const type = req.body.type;

        const text = req.body.text;

        const audioUrl = req.body.audioUrl;

        const imageUrl = req.body.imageUrl;


        if (!userId) {

            return res.status(400).json({

                message: "User ID is required."

            });

        }


        const post = await Post.create({

            user: userId,

            type: type || "voice",

            text: text || "",

            audioUrl: audioUrl || null,

            imageUrl: imageUrl || null

        });


        res.status(201).json({

            message: "Post created successfully.",

            post: post

        });


    } catch (error) {

        console.error(
            "Create post error:",
            error
        );


        res.status(500).json({

            message: "Unable to create post."

        });

    }

});


// =====================================================
// GET ALL POSTS
// =====================================================

router.get("/", async function(req, res) {

    console.log("Get posts request received.");

    try {

        const posts =
            await Post.find()
                .populate(
                    "user",
                    "name username"
                )
                .sort({
                    createdAt: -1
                });


        res.json({

            posts: posts

        });


    } catch (error) {

        console.error(
            "Get posts error:",
            error
        );


        res.status(500).json({

            message: "Unable to load posts."

        });

    }

});


// =====================================================
// LIKE / UNLIKE POST
// =====================================================

router.post(
    "/:postId/like",
    async function(req, res) {

        console.log(
            "Like request received."
        );


        try {

            const postId =
                req.params.postId;

            const userId =
                req.body.userId;


            if (!userId) {

                return res.status(400).json({

                    message:
                        "User ID is required."

                });

            }


            const post =
                await Post.findById(
                    postId
                );


            if (!post) {

                return res.status(404).json({

                    message:
                        "Post not found."

                });

            }


            const alreadyLiked =
                post.likes.some(
                    function(likedUserId) {

                        return (
                            likedUserId.toString() ===
                            userId
                        );

                    }
                );


            if (alreadyLiked) {

                post.likes =
                    post.likes.filter(
                        function(likedUserId) {

                            return (
                                likedUserId.toString() !==
                                userId
                            );

                        }
                    );

            } else {

                post.likes.push(
                    userId
                );

            }


            await post.save();


            res.json({

                message:
                    alreadyLiked
                        ? "Post unliked successfully."
                        : "Post liked successfully.",

                liked:
                    !alreadyLiked,

                likeCount:
                    post.likes.length

            });


        } catch (error) {

            console.error(
                "Like post error:",
                error
            );


            res.status(500).json({

                message:
                    "Unable to like or unlike post."

            });

        }

    }
);


module.exports = router;