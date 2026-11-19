
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("node:path");

const authrouter = require("../src/route/auth.route");
const interviewroute = require("../src/route/interview.route");

const app = express();

app.use(helmet({
    contentSecurityPolicy: false,
}));

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));

// API routes
app.use("/api/user", authrouter);
app.use("/api/interview", interviewroute);

// Serve React frontend
const frontendPath = path.join(__dirname, "../public");

app.use(express.static(frontendPath));

// React Router fallback
app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith("/api/")) {
        return next();
    }

    res.sendFile(path.join(frontendPath, "index.html"));
});

module.exports = app;
