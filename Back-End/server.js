
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

let messageCount = 0;

io.on("connection", (socket) => {
  console.log(` User connected: ${socket.id}`);

  socket.on("register-user", ({ userId, role }) => {
    console.log(`Registered user: ${userId} with role: ${role}`);
  });

  socket.on("markAllNotificationsRead", async ({ userId }) => {
    try {
      await Notification.updateMany(
        { recipient: userId, status: "pending" },
        { $set: { status: "read" } }
      );
      io.emit("notificationCountReset", { userId, count: 0 });
    } catch (error) {
      console.error("Error updating notifications:", error.message);
    }
  });

  socket.on("unvaccinated-alert", (data) => {
    console.log("Unvaccinated alert received:", data);
    io.emit("unvaccinated-alert", data);
  });

  socket.on("send-vaccine-notification", ({types_of_message, message }) => {
    console.log(`Vaccine notification: ${message}`);

    const payload = {
      types_of_message,
      message,
      timestamp: new Date(),
    };

    io.emit("vaccineNotification", payload);
  });

  socket.on("markAsRead", async ({ notificationId, userId }) => {
  try {
    const notif = await Notification.findById(notificationId);
    if (!notif.readBy.includes(userId)) {
      notif.readBy.push(userId);
    }

    notif.status = "read"; 
    await notif.save();
  } catch (err) {
    console.error("Error marking notification as read", err);
  }
});


  socket.on("RefreshData", () => {
    console.log("RefreshData triggered");
    io.emit("refreshRequests"); 
  });

  socket.on("clearNotifications", () => {
    console.log("Notifications cleared");
    io.emit("notificationCountReset", { count: 0 }); 
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
