const dns = require("node:dns");
const fs = require("node:fs");
const path = require("node:path");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const envPath = path.join(__dirname, ".env");
const envContents = (fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "")
    .replace(/^(\s*)Client ID(\s*=)/gm, "$1CLIENT_ID$2")
    .replace(/^(\s*)Client secret(\s*=)/gm, "$1CLIENT_SECRET$2")
    .replace(/^(\s*)Refresh token(\s*=)/gm, "$1REFRESH_TOKEN$2");
const parsedEnvironment = require("dotenv").parse(envContents);
for (const [key, value] of Object.entries(parsedEnvironment)) {
    if (process.env[key] === undefined) {
        process.env[key] = value;
    }
}
const app = require("./src/app");
const connectdb = require("./src/db/db");

async function startServer() {
    if (!process.env.JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY is missing. Configure it in backend/.env before starting the server.");
    }

    connectdb();

    const port = Number(process.env.PORT) || 3000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}.`);
    });
}

startServer().catch((error) => {
    console.error("Server startup failed:", error.message);
    
});