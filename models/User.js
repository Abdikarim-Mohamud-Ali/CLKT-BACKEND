javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({


    // DISPLAY NAME

    // This can contain spaces and is not unique.

    name: {

        type: String,

        required: true,

        trim: true

    },


    // USERNAME

    // This must be unique.

    // Only lowercase letters, numbers, and underscores

    // will be allowed by our registration validation.

    username: {

        type: String,

        required: true,

        unique: true,

        lowercase: true,

        trim: true

    },


    // EMAIL

    email: {

        type: String,

        required: true,

        unique: true,

        lowercase: true,

        trim: true

    },


    // PASSWORD

    password: {

        type: String,

        required: true

    },


    // EMAIL VERIFICATION

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

    },


    // PASSWORD RESET

    passwordResetCode: {

        type: String,

        default: null

    },


    passwordResetCodeExpires: {

        type: Date,

        default: null

    }


});


const User = mongoose.model("User", userSchema);


module.exports = User;

