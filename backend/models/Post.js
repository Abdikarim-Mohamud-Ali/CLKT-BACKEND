const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: ["voice", "text", "photo"],
            default: "voice"
        },

        text: {
            type: String,
            default: ""
        },

        audioUrl: {
            type: String,
            default: null
        }
    },

    {
        timestamps: true
    }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;