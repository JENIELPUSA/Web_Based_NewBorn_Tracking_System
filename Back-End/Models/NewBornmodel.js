const mongoose = require('mongoose');

const newbornSchema = new mongoose.Schema({
  babyCodeNumber:String,
  firstName: String,
  lastName: String,
  middleName: String,
  extensionName:String,
  dateOfBirth: Date,
  gender: String,
  birthWeight: Number,
  birthHeight:Number, 
  motherName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parent",
    required: true
  },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Newborn", newbornSchema);
