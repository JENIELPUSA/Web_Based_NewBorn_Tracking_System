const mongoose = require("mongoose");

const doseSchema = new mongoose.Schema({
  doseNumber: Number,
  dateGiven: { type: Date, required: true },
  next_due_date: Date,
  remarks: String,
  administeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["On-Time", "Delayed", "Missed"],
    required: true,
  },
  notified: {
    type: Boolean,
    default: false,
  }
});

const vaccinationRecordSchema = new mongoose.Schema(
  {
    newborn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Newborn",
      required: true,
    },
    vaccine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vaccine",
      required: true,
    },
    doses: [doseSchema] // array of dose objects (without dosage)
  },
  { timestamps: true }
);

const VaccinationRecord = mongoose.model("VaccinationRecord", vaccinationRecordSchema);
module.exports = VaccinationRecord;
