const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema({
  email: { type: String, sparse: true },
  role: {
    type: String,
    enum: {
      values: ["Admin", "BHW", "Guest"],
      message: "Please select a valid role: Admin, BHW, or Guest.",
    },
    required: [true, "Please select a role."],
  },

  password: {
    type: String,
    select: false,
  },
  avatar: { type: String },

  FirstName: { type: String, required: [true, "Please Enter FirstName."] },
  LastName: { type: String, required: [true, "Please Enter LastName."] },
  Middle: { type: String},
  extensionName: { type: String},
  address: { type: String, required: [true, "Please Enter Address!"] },
  phoneNumber: { type: String },
  dateOfBirth: {
    type: Date,
    required: [true, "Please select a Date of Birth"],
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: [true, "Please select Gender."],
  },
  zone: { type: String },
  Designatedzone: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  otp: { type: String },
  otpExpiresAt: { type: Date },
  isVerified: { type: Boolean, default: false },
});
const User = mongoose.model("Parent", parentSchema);

module.exports = User;
