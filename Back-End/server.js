
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const Notification =require("./Models/NotificationSchema")

const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const app = require("./app");

const user = require("./Models/usermodel");
const sendEmail = require("./Utils/email"); 

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception! Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["polling", "websocket"],
  pingInterval: 25000,
  pingTimeout: 60000,
});


app.set("io", io);

global.connectedUsers = {}; // userId: { socketId, role }

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Register user with role
  socket.on("register-user", ({ userId, role }) => {
    if (userId && role) {
      global.connectedUsers[userId] = { socketId: socket.id, role };
      console.log(`👤 Registered user: ${userId} (${role})`);
    }
  });

  // Mark all notifications as read
  socket.on("markAllNotificationsRead", async ({ userId }) => {
    try {
      await Notification.updateMany(
        { "viewers.user": userId },
        { $set: { "viewers.$.isRead": true } }
      );
      io.to(socket.id).emit("notificationCountReset", { userId, count: 0 });
    } catch (error) {
      console.error("Error updating notifications:", error.message);
    }
  });

  // Broadcast only to admins, BHWs, or mother
  socket.on("send-vaccine-notification", ({ types_of_message, message }) => {
    const payload = {
      types_of_message,
      message,
      timestamp: new Date(),
    };

    for (const userId in global.connectedUsers) {
      const { socketId, role } = global.connectedUsers[userId];
      if (["Admin", "BHW", "Mother"].includes(role)) {
        io.to(socketId).emit("vaccineNotification", payload);
        console.log(`Sent to ${role}: ${userId}`);
      }
    }
  });

  // Unvaccinated alert broadcast
  socket.on("unvaccinated-alert", (data) => {
    console.log("Unvaccinated alert received:", data);
    io.emit("unvaccinated-alert", data);
  });

  // Mark individual notification as read
  socket.on("markAsRead", async ({ notificationId, userId }) => {
    try {
      const notif = await Notification.findById(notificationId);
      if (notif) {
        const viewer = notif.viewers.find((v) => v.user.toString() === userId);
        if (viewer && !viewer.isRead) {
          viewer.isRead = true;
          await notif.save();
        }
      }
    } catch (err) {
      console.error("Error marking notification as read", err);
    }
  });

  // Refresh UI
  socket.on("RefreshData", () => {
    io.emit("refreshRequests");
  });

  // Clear notification count
  socket.on("clearNotifications", () => {
    io.emit("notificationCountReset", { count: 0 });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    for (const userId in global.connectedUsers) {
      if (global.connectedUsers[userId].socketId === socket.id) {
        delete global.connectedUsers[userId];
        break;
      }
    }
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
