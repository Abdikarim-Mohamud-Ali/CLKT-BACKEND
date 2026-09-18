

const express = require("express");

const bcrypt = require("bcryptjs");

const crypto = require("crypto");

const jwt = require("jsonwebtoken");

const User = require("../models/User");

const {
    sendVerificationEmail,
    sendPasswordResetEmail
} = require("../services/emailService");

const router = express.Router();


router.post("/register", async function(req, res) {

    try {

        const {
            name,
            username,
            email,
            password
        } = req.body;


        if (!name || !username || !email || !password) {

            return res.status(400).json({

                message:
                    "Name, username, email and password are required."

            });

        }


        const cleanUsername = username
            .trim()
            .toLowerCase();


        const usernamePattern = /^[a-z0-9_]{3,30}$/;


        if (!usernamePattern.test(cleanUsername)) {

            return res.status(400).json({

                message:
                    "Username must be 3–30 characters and contain only letters, numbers and underscores."

            });

        }


        const existingUsername = await User.findOne({

            username: cleanUsername

        });


        if (existingUsername) {

            return res.status(400).json({

                message:
                    "That username is already taken."

            });

        }


        const cleanEmail = email
            .trim()
            .toLowerCase();


        const existingUser = await User.findOne({

            email: cleanEmail

        });


        if (existingUser) {

            return res.status(400).json({

                message:
                    "An account with this email already exists."

            });

        }


        const verificationCode = crypto
            .randomInt(100000, 1000000)
            .toString();


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


        await user.save();


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


        if (error.code === 11000) {

            if (
                error.keyPattern &&
                error.keyPattern.username
            ) {

                return res.status(400).json({

                    message:
                        "That username is already taken."

                });

            }


            if (
                error.keyPattern &&
                error.keyPattern.email
            ) {

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


router.post("/resend-verification", async function(req, res) {

    try {

        const { email } = req.body;


        const cleanEmail = email
            .trim()
            .toLowerCase();


        const user = await User.findOne({

            email: cleanEmail

        });


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found."

            });

        }


        if (user.isVerified) {

            return res.status(400).json({

                message:
                    "This email is already verified."

            });

        }


        const verificationCode = crypto
            .randomInt(100000, 1000000)
            .toString();


        user.verificationCode = verificationCode;

        user.verificationCodeExpires = new Date(

            Date.now() + 10 * 60 * 1000

        );


        await user.save();


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


router.post("/verify", async function(req, res) {

    try {

        const {
            email,
            code
        } = req.body;


        const cleanEmail = email
            .trim()
            .toLowerCase();


        const user = await User.findOne({

            email: cleanEmail

        });


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found."

            });

        }


        if (user.isVerified) {

            return res.status(400).json({

                message:
                    "This email is already verified."

            });

        }


        if (!user.verificationCode) {

            return res.status(400).json({

                message:
                    "No verification code found."

            });

        }


        if (new Date() > user.verificationCodeExpires) {

            return res.status(400).json({

                message:
                    "Verification code has expired."

            });

        }


        if (code !== user.verificationCode) {

            return res.status(400).json({

                message:
                    "Incorrect verification code."

            });

        }


        user.isVerified = true;

        user.verificationCode = null;

        user.verificationCodeExpires = null;


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


router.post("/forgot-password", async function(req, res) {

    try {

        const { login } = req.body;


        if (!login) {

            return res.status(400).json({

                message:
                    "Email or username is required."

            });

        }


        const cleanLogin = login
            .trim()
            .toLowerCase();


        const user = await User.findOne({

            $or: [

                {
                    email: cleanLogin
                },

                {
                    username: cleanLogin
                }

            ]

        });


        if (!user) {

            return res.json({

                message:
                    "If an account matches those details, a password reset code has been sent."

            });

        }


        const passwordResetCode = crypto
            .randomInt(100000, 1000000)
            .toString();


        user.passwordResetCode = passwordResetCode;

        user.passwordResetCodeExpires = new Date(

            Date.now() + 10 * 60 * 1000

        );


        await user.save();


        await sendPasswordResetEmail(

            user.name,

            user.email,

            passwordResetCode

        );


        const emailParts = user.email.split("@");

        const localPart = emailParts[0];

        const domain = emailParts[1];


        let maskedLocalPart;


        if (localPart.length === 1) {

            maskedLocalPart = localPart + "••••";

        } else if (localPart.length === 2) {

            maskedLocalPart =
                localPart[0] + "•";

        } else {

            maskedLocalPart =
                localPart[0] +
                "•".repeat(localPart.length - 2) +
                localPart[localPart.length - 1];

        }


        const maskedEmail =
            maskedLocalPart + "@" + domain;


        res.json({

            message:
                "A password reset code has been sent.",

            maskedEmail: maskedEmail

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            message:
                "Could not send password reset code."

        });

    }

});


router.post("/login", async function(req, res) {

    try {

        const {
            login,
            password
        } = req.body;


        if (!login || !password) {

            return res.status(400).json({

                message:
                    "Email or username and password are required."

            });

        }


        const cleanLogin = login
            .trim()
            .toLowerCase();


        const user = await User.findOne({

            $or: [

                {
                    email: cleanLogin
                },

                {
                    username: cleanLogin
                }

            ]

        });


        if (!user) {

            return res.status(401).json({

                message:
                    "Invalid email, username or password."

            });

        }


        if (!user.isVerified) {

            return res.status(403).json({

                message:
                    "Please verify your email before logging in."

            });

        }


        const passwordMatches = await bcrypt.compare(

            password,

            user.password

        );


        if (!passwordMatches) {

            return res.status(401).json({

                message:
                    "Invalid email, username or password."

            });

        }


        const token = jwt.sign(

            {
                userId: user._id
            },

            process.env.JWT_SECRET,

            {

                expiresIn: "7d"

            }

        );


        res.json({

            message:
                "Login successful.",

            token: token,

            user: {

                id: user._id,

                name: user.name,

                username: user.username,

                email: user.email

            }

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            message:
                "Login failed."

        });

    }

});


module.exports = router;

