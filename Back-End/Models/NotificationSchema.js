const mongoose = require('mongoose');

const notifcationSchema = new mongoose.Schema({
  message: String,
  status: {
    type: String,
    enum: ['read', 'pending'],
    default: 'pending' 
  },
  newborn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Newborn", 
    required: true
  },
   readBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" // Array to store the user IDs that have read the notification
  }],
  types_of_message:String
}, { timestamps: true });

module.exports = mongoose.model("Notification", notifcationSchema);