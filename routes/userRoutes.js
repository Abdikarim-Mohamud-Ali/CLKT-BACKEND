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

    const { name, username, email, password } = req.body;


    // MAKE SURE REQUIRED INFORMATION WAS PROVIDED

    if (!name || !username || !email || !password) {

        return res.status(400).json({

            message:
                "Name, username, email and password are required."

        });

    }


    // CLEAN THE USERNAME

    const cleanUsername = username
        .trim()
        .toLowerCase();


    // CHECK USERNAME FORMAT

    const usernamePattern = /^[a-z0-9_]{3,30}$/;


    if (!usernamePattern.test(cleanUsername)) {

        return res.status(400).json({

            message:
                "Username must be 3–30 characters and contain only letters, numbers and underscores."

        });

    }


    // CHECK IF THE USERNAME ALREADY EXISTS

    const existingUsername = await User.findOne({

        username: cleanUsername

    });


    if (existingUsername) {

        return res.status(400).json({

            message:
                "That username is already taken."

        });

    }


    // CLEAN THE EMAIL

    const cleanEmail = email
        .trim()
        .toLowerCase();


    // CHECK IF THE EMAIL ALREADY EXISTS

    const existingUser = await User.findOne({

        email: cleanEmail

    });


    if (existingUser) {

        return res.status(400).json({

            message:
                "An account with this email already exists."

        });

    }


    // CREATE A 6-DIGIT VERIFICATION CODE

    const verificationCode = crypto
        .randomInt(100000, 1000000)
        .toString();


    // CREATE THE USER

    const user = new User({

        name: name.trim(),

        username: cleanUsername,

        email: cleanEmail,

        password: await bcrypt.hash(password, 10),

        verificationCode: verificationCode,

        verificationCodeExpires: new Date(

            Date.now() + 10 * 60 * 1000

        )

    });


    // SAVE USER TO MONGODB

    await user.save();


    // SEND VERIFICATION EMAIL

    await sendVerificationEmail(

        user.name,

        user.email,

        verificationCode

    );


    res.json({

        message:
            "User registered successfully!"

    });


} catch (error) {

    console.error(error);


    // Handle a MongoDB duplicate username/email
    // in case two requests arrive at nearly the same time.

    if (error.code === 11000) {

        if (error.keyPattern && error.keyPattern.username) {

            return res.status(400).json({

                message:
                    "That username is already taken."

            });

        }


        if (error.keyPattern && error.keyPattern.email) {

            return res.status(400).json({

                message:
                    "An account with this email already exists."

            });

        }

    }


    res.status(500).json({

        message:
            "Registration failed."

    });

}


});

// RESEND VERIFICATION CODE

router.post("/resend-verification", async function(req, res) {


try {

    const { email } = req.body;


    // CLEAN THE EMAIL

    const cleanEmail = email
        .trim()
        .toLowerCase();


    // FIND THE USER

    const user = await User.findOne({

        email: cleanEmail

    });


    if (!user) {

        return res.status(404).json({

            message:
                "User not found."

        });

    }


    // CHECK WHETHER EMAIL IS ALREADY VERIFIED

    if (user.isVerified) {

        return res.status(400).json({

            message:
                "This email is already verified."

        });

    }


    // GENERATE A NEW 6-DIGIT CODE

    const verificationCode = crypto
        .randomInt(100000, 1000000)
        .toString();


    // GIVE THE NEW CODE A 10-MINUTE EXPIRATION

    user.verificationCode = verificationCode;

    user.verificationCodeExpires = new Date(

        Date.now() + 10 * 60 * 1000

    );


    // SAVE THE NEW CODE

    await user.save();


    // SEND THE NEW VERIFICATION EMAIL

    // Use the user's saved name.

    await sendVerificationEmail(

        user.name,

        user.email,

        verificationCode

    );


    res.json({

        message:
            "A new verification code has been sent."

    });


} catch (error) {

    console.error(error);


    res.status(500).json({

        message:
            "Could not resend verification code."

    });

}


});

// VERIFY EMAIL

router.post("/verify", async function(req, res) {


try {

    const { email, code } = req.body;


    // FIND THE USER

    const user = await User.findOne({

        email: email

    });


    if (!user) {

        return res.status(404).json({

            message:
                "User not found."

        });

    }


    // CHECK IF THE ACCOUNT IS ALREADY VERIFIED

    if (user.isVerified) {

        return res.status(400).json({

            message:
                "This email is already verified."

        });

    }


    // CHECK IF A VERIFICATION CODE EXISTS

    if (!user.verificationCode) {

        return res.status(400).json({

            message:
                "No verification code found."

        });

    }


    // CHECK IF THE CODE HAS EXPIRED

    if (new Date() > user.verificationCodeExpires) {

        return res.status(400).json({

            message:
                "Verification code has expired."

        });

    }


    // CHECK IF THE CODE IS CORRECT

    if (code !== user.verificationCode) {

        return res.status(400).json({

            message:
                "Incorrect verification code."

        });

    }


    // VERIFY THE ACCOUNT

    user.isVerified = true;


    // DELETE THE USED VERIFICATION CODE

    user.verificationCode = null;

    user.verificationCodeExpires = null;


    // SAVE THE CHANGES

    await user.save();


    res.json({

        message:
            "Email verified successfully!"

    });


} catch (error) {

    console.error(error);


    res.status(500).json({

        message:
            "Verification failed."

    });

}


});

module.exports = router;
