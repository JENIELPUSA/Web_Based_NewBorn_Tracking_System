const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const app = require("./app");
const user = require("./Models/usermodel");
const sendEmail = require("../Back-End/Utils/email");
dotenv.config({ path: "./config.env" });

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception! Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Create HTTP server and integrate with Socket.io
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Use the environment variable for frontend URL
    methods: ["GET", "POST"],
    credentials: true, // Allow cookies and auth headers
  },
  transports: ["websocket"], // Force websocket transport for better performance
  pingInterval: 25000, // Interval to ping clients
  pingTimeout: 60000, // Timeout for ping response
});

// Store io instance for global event handling
app.set("io", io);

let adminSocketId = null; // To store the admin's socket ID
let messageCount = 0; // Track new notifications count

// Socket.io event handling
io.on("connection", (socket) => {
  // Register user and admin socket ID
  socket.on("register-user", (userId, role) => {
    console.log(role);
    if (role === "admin") {
      adminSocketId = socket.id; // Save the admin's socket ID
      console.log(`Admin registered with socket ID ${socket.id}`);
    }
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  // Handling new request
  socket.on("newRequest", (data) => {
    messageCount++; // Increment the count
    console.log("New request received:", data);

    // Send notification to all connected clients
    io.emit("adminNotification", {
      message: "A new request has been added!",
      data: data,
      count: messageCount, // Send count along with notification
    });

    io.emit("SMSNotification", {
      message: "A new request has been added!",
      data,
      count: messageCount, // Send count along with notification
    });

  });




socket.on("RefreshData",()=>{
  console.log("RunRefresh")
  socket.emit('refreshRequests');
})

  

  // Reset notification count when cleared
  socket.on("clearNotifications", () => {
    messageCount = 0; // Reset count
    io.emit("notificationCountReset", { count: 0 });
  });

  // Handling disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected: ", socket.id);

    // If the admin disconnects, clear the adminSocketId
    if (socket.id === adminSocketId) {
      adminSocketId = null;
      console.log("Admin disconnected, adminSocketId cleared");
    }
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.CONN_STR)
  .then(() => console.log("DB connected successfully"))
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exit(1);
  });

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection! Shutting down...");
  console.error(err.name, err.message, err.stack);

  server.close(() => {
    process.exit(1);
  });
});


