const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  DateTime: {
    type: String,
    default: () => new Date().toISOString(), // Automatically set current date and time
  },
  message: {
    type: String,
  },
  Status: {
    type: String,
  },
  Laboratory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Laboratory", // Reference to the Equipment model
      required: true,
    },
  ],
  To:{
    type:String
  },
  RequestID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RequestMaintenances", // Reference to the
  },
  Encharge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the
  },
  role: { 
    type: String, 
    enum: ["Admin", "User", "Technician"], 
    default: "User",
    required: true 
  }, 
  read: { type: Boolean, default: false },
  readonUser:{ type: Boolean, default: false },
});

const Messages = mongoose.model("Message", messageSchema);

module.exports = Messages;
