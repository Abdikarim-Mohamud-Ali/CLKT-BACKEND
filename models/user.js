const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    verificationCode: {
        type: String,
        default: null
    },

    verificationCodeExpires: {
        type: Date,
        default: null
    }

});

const User = mongoose.model("User", userSchema);

module.exports = User;