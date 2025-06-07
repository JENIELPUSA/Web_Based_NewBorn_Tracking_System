const mongoose = require("mongoose");

const assignedVaccineSchema = new mongoose.Schema({
  newborn: { type: mongoose.Schema.Types.ObjectId, ref: "Newborn"},
  vaccine: { type: mongoose.Schema.Types.ObjectId, ref: "Vaccine"},
  totalDoses: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  notified: {
    type: Boolean,
    default: false,
  },
  sentComplet:{
    type:Boolean,
    default:false
  }
}, { timestamps: true });

module.exports = mongoose.model("AssignedVaccine", assignedVaccineSchema);
