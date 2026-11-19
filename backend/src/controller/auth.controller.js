const usermodel = require("../model/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const blacklistedmodel = require("../model/blacklisted.model");
const { sendotpemail, sendloginemail } = require("../services/email.service");

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

const authCookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
};

function createAuthToken(user) {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY);
}

function publicUser(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
    };
}

async function sendVerificationCode(user) {
    const now = new Date();
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const updatedUser = await usermodel.findOneAndUpdate(
        {
            _id: user._id,
            emailVerified: false,
            $or: [
                { emailVerificationLastSentAt: null },
                { emailVerificationLastSentAt: { $lte: new Date(now.getTime() - OTP_RESEND_COOLDOWN_MS) } },
            ],
        },
        {
            $set: {
                emailVerificationOtpHash: otpHash,
                emailVerificationOtpExpiresAt: new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000),
                emailVerificationOtpAttempts: 0,
                emailVerificationLastSentAt: now,
            },
        },
        { new: true },
    );
    if (!updatedUser) {
        const error = new Error("Please wait before requesting another verification code.");
        error.statusCode = 429;
        throw error;
    }

    try {
        await sendotpemail(updatedUser.username, updatedUser.email, otp);
    } catch (error) {
        await usermodel.updateOne(
            { _id: updatedUser._id, emailVerificationOtpHash: otpHash },
            {
                $set: {
                    emailVerificationOtpHash: null,
                    emailVerificationOtpExpiresAt: null,
                    emailVerificationOtpAttempts: 0,
                    emailVerificationLastSentAt: null,
                },
            },
        );
        throw error;
    }
}

async function userregister(req, res) {
    const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required." });
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        return res.status(400).json({ message: "Please provide a valid email address." });
    }

    try {
        const existingUser = await usermodel.findOne({
            $or: [{ username }, { email }],
        });

        if (existingUser) {
            return res.status(409).json({ message: "An account with that username or email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await usermodel.create({
            username,
            email,
            password: hashedPassword,
            emailVerified: false,
        });

        try {
            await sendVerificationCode(user);
        } catch (error) {
            console.error("Verification email delivery failed:", error);
            return res.status(error.statusCode || 503).json({
                message: error.statusCode === 429
                    ? error.message
                    : "Your account was created, but the verification email could not be sent. Please request a new code.",
                email: user.email,
            });
        }

        return res.status(201).json({
            message: "Account created. Enter the verification code sent to your email.",
            email: user.email,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "An account with that username or email already exists." });
        }

        console.error("Registration failed:", error);
        return res.status(500).json({ message: "Unable to create your account right now. Please try again." });
    }
}

async function userverifyemail(req, res) {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const otp = typeof req.body?.otp === "string" ? req.body.otp.trim() : "";

    if (!email || !/^\d{6}$/.test(otp)) {
        return res.status(400).json({ message: "Enter a valid email address and six-digit verification code." });
    }

    try {
        const user = await usermodel.findOne({ email, emailVerified: false });
        if (!user || !user.emailVerificationOtpHash) {
            return res.status(400).json({ message: "No pending email verification was found. Request a new code." });
        }

        if (!user.emailVerificationOtpExpiresAt || user.emailVerificationOtpExpiresAt.getTime() <= Date.now()) {
            user.emailVerificationOtpHash = null;
            user.emailVerificationOtpExpiresAt = null;
            user.emailVerificationOtpAttempts = 0;
            await user.save();
            return res.status(400).json({ message: "Your verification code expired. Request a new code." });
        }

        const attemptedUser = await usermodel.findOneAndUpdate(
            {
                _id: user._id,
                emailVerified: false,
                emailVerificationOtpHash: user.emailVerificationOtpHash,
                emailVerificationOtpAttempts: { $lt: MAX_OTP_ATTEMPTS },
            },
            { $inc: { emailVerificationOtpAttempts: 1 } },
            { new: true },
        );
        if (!attemptedUser) {
            return res.status(429).json({ message: "Too many incorrect codes. Request a new code to try again." });
        }

        const codeMatches = await bcrypt.compare(otp, attemptedUser.emailVerificationOtpHash);
        if (!codeMatches) {
            return res.status(attemptedUser.emailVerificationOtpAttempts >= MAX_OTP_ATTEMPTS ? 429 : 400).json({
                message: attemptedUser.emailVerificationOtpAttempts >= MAX_OTP_ATTEMPTS
                    ? "Too many incorrect codes. Request a new code to try again."
                    : "That verification code is incorrect.",
            });
        }

        attemptedUser.emailVerified = true;
        attemptedUser.emailVerificationOtpHash = null;
        attemptedUser.emailVerificationOtpExpiresAt = null;
        attemptedUser.emailVerificationOtpAttempts = 0;
        attemptedUser.emailVerificationLastSentAt = null;
        await attemptedUser.save();

        res.cookie("token", createAuthToken(attemptedUser), authCookieOptions);
        return res.status(200).json({
            message: "Email verified successfully.",
            user: publicUser(attemptedUser),
        });
    } catch (error) {
        console.error("Email verification failed:", error);
        return res.status(500).json({ message: "Unable to verify your email right now. Please try again." });
    }
}

async function userresendverification(req, res) {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    try {
        const user = await usermodel.findOne({ email, emailVerified: false });
        if (!user) {
            return res.status(200).json({
                message: "If an unverified account exists for this email, a new code has been sent.",
            });
        }

        await sendVerificationCode(user);
        return res.status(200).json({ message: "A new verification code has been sent to your email." });
    } catch (error) {
        if (error.statusCode === 429) {
            return res.status(429).json({ message: error.message });
        }
        console.error("Verification code resend failed:", error);
        return res.status(503).json({ message: "Unable to send a verification code right now. Please try again." });
    }
}

async function userlogin(req, res) {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await usermodel.findOne({ email });
        const passwordMatches = user && await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        if (user.emailVerified === false) {
            return res.status(403).json({
                code: "EMAIL_NOT_VERIFIED",
                message: "Please verify your email before signing in.",
            });
        }

        try {
            await sendloginemail(user.username, user.email);
        } catch (error) {
            console.error("Login notification email delivery failed:", error);
            return res.status(503).json({
                message: "We could not send your sign-in email. Please try again shortly.",
            });
        }

        res.cookie("token", createAuthToken(user), authCookieOptions);
        return res.status(200).json({
            message: "Signed in successfully.",
            user: publicUser(user),
        });
    } catch (error) {
        console.error("Login failed:", error);
        return res.status(500).json({ message: "Unable to sign in right now. Please try again." });
    }
}

async function userlogout(req, res) {
    const token = req.cookies.token;
    if (token) {
        await blacklistedmodel.create({ token });
    }
    res.clearCookie("token", authCookieOptions);
    return res.status(200).json({ message: "Signed out successfully." });
}

async function usergetme(req, res) {
    return res.status(200).json({
        message: "User is fetched",
        user: publicUser(req.user),
    });
}

module.exports = {
    userregister,
    userverifyemail,
    userresendverification,
    userlogin,
    userlogout,
    usergetme,
};
