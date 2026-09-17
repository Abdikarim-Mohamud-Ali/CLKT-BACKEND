const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");

const {
sendVerificationEmail
} = require("../services/emailService");

const router = express.Router();

// REGISTER

router.post("/register", async function(req, res) {


try {

    const { name, email, password } = req.body;


    // Check if the email already exists

    const existingUser = await User.findOne({
        email: email
    });


    if (existingUser) {

        return res.status(400).json({
            message: "An account with this email already exists."
        });

    }


    // Create a 6-digit verification code

    const verificationCode = crypto
        .randomInt(100000, 1000000)
        .toString();


    // Create the user

    const user = new User({

        name: name,

        email: email,

        password: await bcrypt.hash(password, 10),

        verificationCode: verificationCode,

        verificationCodeExpires: new Date(
            Date.now() + 10 * 60 * 1000
        )

    });


    // Save the user to MongoDB

    await user.save();


    // Send verification email

    // We now send:
    // name + email + verification code

    await sendVerificationEmail(
        name,
        email,
        verificationCode
    );


    res.json({
        message: "User registered successfully!"
    });

} catch (error) {

    console.error(error);

    res.status(500).json({
        message: "Registration failed."
    });

}


});

// RESEND VERIFICATION CODE

router.post("/resend-verification", async function(req, res) {


try {

    const { email } = req.body;


    // Find the user

    const user = await User.findOne({
        email: email
    });


    if (!user) {

        return res.status(404).json({
            message: "User not found."
        });

    }


    // Check whether the email is already verified

    if (user.isVerified) {

        return res.status(400).json({
            message: "This email is already verified."
        });

    }


    // Generate a new 6-digit code

    const verificationCode = crypto
        .randomInt(100000, 1000000)
        .toString();


    // Give the new code a 10-minute expiration

    user.verificationCode = verificationCode;

    user.verificationCodeExpires = new Date(
        Date.now() + 10 * 60 * 1000
    );


    // Save the new code

    await user.save();


    // Send the new verification email

    // Use the name stored in MongoDB

    await sendVerificationEmail(
        user.name,
        user.email,
        verificationCode
    );


    res.json({
        message: "A new verification code has been sent."
    });

} catch (error) {

    console.error(error);

    res.status(500).json({
        message: "Could not resend verification code."
    });

}


});

// VERIFY EMAIL

router.post("/verify", async function(req, res) {


try {

    const { email, code } = req.body;


    // Find the user

    const user = await User.findOne({
        email: email
    });


    if (!user) {

        return res.status(404).json({
            message: "User not found."
        });

    }


    // Check if the account is already verified

    if (user.isVerified) {

        return res.status(400).json({
            message: "This email is already verified."
        });

    }


    // Check if a verification code exists

    if (!user.verificationCode) {

        return res.status(400).json({
            message: "No verification code found."
        });

    }


    // Check if the code has expired

    if (new Date() > user.verificationCodeExpires) {

        return res.status(400).json({
            message: "Verification code has expired."
        });

    }


    // Check if the code is correct

    if (code !== user.verificationCode) {

        return res.status(400).json({
            message: "Incorrect verification code."
        });

    }


    // Verify the account

    user.isVerified = true;


    // Delete the used verification code

    user.verificationCode = null;

    user.verificationCodeExpires = null;


    // Save the changes

    await user.save();


    res.json({
        message: "Email verified successfully!"
    });

} catch (error) {

    console.error(error);

    res.status(500).json({
        message: "Verification failed."
    });

}


});

module.exports = router;
