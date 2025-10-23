const { google } = require("googleapis");
const dotenv = require("dotenv");

// Load environment variables from config.env
dotenv.config({ path: "./config.env" });

// OAuth2 client setup
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI // kailangan lang sa token generation
);

// Set credentials using refresh token
oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

// Helper function to encode email in base64url
function makeRawMessage({ from, to, subject, text, html }) {
  const messageParts = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html || text || "No message content",
  ];

  return Buffer.from(messageParts.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Main send email function
const sendEmail = async ({ email, subject, text, html }) => {
  try {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const raw = makeRawMessage({
      from: `Newborn Tracking System <${process.env.SENDER_EMAIL || "jeniel12300@gmail.com"}>`,
      to: email,
      subject,
      text,
      html,
    });

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    console.log(`✅ Email sent successfully to ${email}`);
  } catch (error) {
    console.error("❌ Error sending email via Gmail API:", error);
  }
};

module.exports = sendEmail;
