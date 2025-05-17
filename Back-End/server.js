const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const app = require("./app");
const user = require("./Models/usermodel");
const sendEmail = require("../Back-End/Utils/email");
const IncomingNotification = require("./Models/UnreadIncomingMaintenance");
const requestmaintenance = require("./Models/RequestMaintenance")
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


  socket.on("RequestMaintenance", async (data) => {
    try {
      const requestId = data._id;
  
      // Get the original request document
      const originalRequest = await requestmaintenance.findById(requestId).lean();
  
      if (!originalRequest) {
        console.error("Maintenance request not found.");
        return;
      }
  
      const [extraInfo] = await requestmaintenance.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(requestId) } },
        {
          $lookup: {
            from: "users",
            localField: "Technician",
            foreignField: "_id",
            as: "TechnicianDetails"
          }
        },
        { $unwind: { path: "$TechnicianDetails", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "departments",
            localField: "Department",
            foreignField: "_id",
            as: "DepartmentInfo"
          }
        },
        { $unwind: { path: "$DepartmentInfo", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "laboratories",
            localField: "Laboratory",
            foreignField: "_id",
            as: "LaboratoryInfo"
          }
        },
        { $unwind: { path: "$LaboratoryInfo", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "equipment",
            localField: "Equipments",
            foreignField: "_id",
            as: "EquipmentsInfo"
          }
        },
        { $unwind: { path: "$EquipmentsInfo", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "categories",
            localField: "EquipmentsInfo.Category",
            foreignField: "_id",
            as: "CategoryInfo"
          }
        },
        { $unwind: { path: "$CategoryInfo", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            id: 1,
            DateTime: 1,
            Ref: 1,
            read: 1,
            Status: 1,
            feedback: 1,
            feedbackread: 1,
            Description: 1,
            EquipmentId: { $ifNull: ["$EquipmentsInfo._id", "N/A"] },
            EquipmentName: { $ifNull: ["$EquipmentsInfo.Brand", "N/A"] },
            CategoryName: { $ifNull: ["$CategoryInfo.CategoryName", "N/A"] },
            DepartmentId: "$DepartmentInfo._id",
            _id: 1,
            Remarks: 1,
            Department: { $ifNull: ["$DepartmentInfo.DepartmentName", "N/A"] },
            remarksread: 1,
            laboratoryName: { $ifNull: ["$LaboratoryInfo.LaboratoryName", "N/A"] },
            UserId: "$TechnicianDetails._id",
            Technician: {
              $concat: [
                "$TechnicianDetails.FirstName",
                " ",
                { $ifNull: ["$TechnicianDetails.Middle", ""] },
                " ",
                "$TechnicianDetails.LastName"
              ]
            },
            DateTimeAccomplish: 1
          }
        }
      ]);
  
      const finalRequest = {
        ...originalRequest,
        ...extraInfo // Includes all projected fields
      };
  
      // Emit to all connected clients
      io.emit("Maintenance", finalRequest);
      io.emit("UpdateMaintenance", finalRequest);
  
      console.log("Emitted Maintenance:", finalRequest);
    } catch (error) {
      console.error("Error in RequestMaintenance:", error);
    }
  });
  

socket.on("RefreshData",()=>{
  console.log("RunRefresh")
  socket.emit('refreshRequests');
})

  

  socket.on("send-notifications", async (data) => {
    if (adminSocketId) {
      // Admin is online — send real-time notification
      io.to(adminSocketId).emit("maintenance-notifications", data);
    } else {
      // Admin is offline — save to DB and send emails individually
      try {
        // Save to database
        await IncomingNotification.create({
          Description: data.Description,
          Equipments: data.equipmentType,
          Department: data.Department,
          Laboratory: data.Laboratory,
        });
        console.log("Admin is offline. Notification saved to DB.");

        // Get all admin users
        const admins = await user.find({ role: "admin" });
        const resetUrl = `https://myapp-xk0w.onrender.com`;
        // Construct message
        const msg = `
          Please check your dashboard. A new maintenance request has been submitted and requires your attention.\nClick to login: ${resetUrl}
        `;

        // Send individual email to each admin
        for (const admin of admins) {
          await sendEmail({
            email: admin.email,
            subject: "New Maintenance Notification",
            text: msg,
          });
        }
      } catch (err) {
        console.error("Failed to handle offline admin notification:", err.message);
      }
    }
  });

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

// Include your cron job if applicable
require("./Utils/CronJob");
