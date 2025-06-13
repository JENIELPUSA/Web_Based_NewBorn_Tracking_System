// Load environment variables
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const Notification =require("./Models/NotificationSchema")

// Core dependencies
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const app = require("./app");

// Models and Utilities
const user = require("./Models/usermodel");
const sendEmail = require("./Utils/email"); // Corrected relative path

// Handle uncaught exceptions (sync code errors)
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception! Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Create HTTP server and integrate with Socket.io
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"], // Allow both
  pingInterval: 25000,
  pingTimeout: 60000,
});


// Attach io to app for use in routes/controllers
app.set("io", io);

let messageCount = 0; // Global notification counter

io.on("connection", (socket) => {
  console.log(` User connected: ${socket.id}`);

  // --- REGISTER USER --- (simplified: logging only)
  socket.on("register-user", ({ userId, role }) => {
    console.log(`Registered user: ${userId} with role: ${role}`);
  });

  // --- MARK NOTIFICATIONS READ --- (still per-user)
  socket.on("markAllNotificationsRead", async ({ userId }) => {
    try {
      await Notification.updateMany(
        { recipient: userId, status: "pending" },
        { $set: { status: "read" } }
      );
      // You can use io.emit instead, but this targets a specific user by ID
      io.emit("notificationCountReset", { userId, count: 0 });
    } catch (error) {
      console.error("Error updating notifications:", error.message);
    }
  });

  // --- UNVACCINATED ALERT (broadcast to all)
  socket.on("unvaccinated-alert", (data) => {
    console.log("Unvaccinated alert received:", data);
    io.emit("unvaccinated-alert", data); // broadcast to all connected clients
  });

  // --- VACCINE NOTIFICATION ---
  socket.on("send-vaccine-notification", ({types_of_message, message }) => {
    console.log(`Vaccine notification: ${message}`);

    const payload = {
      types_of_message,
      message,
      timestamp: new Date(),
    };

    io.emit("vaccineNotification", payload); // broadcast to everyone
  });

  socket.on("markAsRead", async ({ notificationId, userId }) => {
  try {
    const notif = await Notification.findById(notificationId);
    if (!notif.readBy.includes(userId)) {
      notif.readBy.push(userId);
    }

    notif.status = "read"; // optional depende sa logic mo
    await notif.save();
  } catch (err) {
    console.error("Error marking notification as read", err);
  }
});


  // --- MANUAL REFRESH TRIGGER ---
  socket.on("RefreshData", () => {
    console.log("RefreshData triggered");
    io.emit("refreshRequests"); // all users get the update
  });

  socket.on("clearNotifications", () => {
    console.log("Notifications cleared");
    io.emit("notificationCountReset", { count: 0 }); // broadcast reset
  });
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

mongoose
  .connect(process.env.CONN_STR, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected successfully"))
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exit(1);
  });

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection! Shutting down...");
  console.error(err.name, err.message, err.stack);
  server.close(() => process.exit(1));
});

require("./Utils/CronJob");
require("./Utils/CronJobforAccounts");
