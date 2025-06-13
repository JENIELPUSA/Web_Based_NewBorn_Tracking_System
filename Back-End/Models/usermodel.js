const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
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

  FirstName: { type: String, required: [true, "Please Enter FirstName."] }, // First name of the user
  LastName: { type: String, required: [true, "Please Enter LastName."] }, // Last name of the user
  address: { type: String, required: [true, "Please Enter Address!"] }, // Home address of the user
  phoneNumber: { type: String }, // Contact number of the user
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

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.methods.comparePasswordInDb = async function (pswd, pswdDB) {
  return await bcrypt.compare(pswd, pswdDB);
};

userSchema.methods.isPasswordChanged = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const pswdChangedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000
    );
    return JWTTimestamp < pswdChangedTimestamp;
  }
  return false;
};

userSchema.pre("save", function (next) {
  if (this.role === "Guest") {
    this.password = undefined;
  }
  next();
});


userSchema.methods.createResetTokenPassword = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

  return resetToken;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
