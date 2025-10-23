const { google } = require("googleapis");
const dotenv = require("dotenv");

// Load environment variables from config.env
dotenv.config({ path: "./config.env" });

// OAuth2 client setup
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Gmail API scope
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

// Generate the authentication URL
const url = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
});

console.log("Open this URL in your browser:\n", url);

// Read authorization code from user input
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question("Paste the authorization code here: ", async (code) => {
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    console.log("Refresh token:", tokens.refresh_token);
  } catch (error) {
    console.error("❌ Error getting token:", error);
  } finally {
    readline.close();
  }
});
