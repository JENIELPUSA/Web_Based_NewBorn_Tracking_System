const mongoose = require("mongoose");

const vaccinationRecordSchema = new mongoose.Schema(
  {
    newborn: { type: mongoose.Schema.Types.ObjectId, ref: "Newborn", required: true },
    vaccine: { type: mongoose.Schema.Types.ObjectId, ref: "Vaccine", required: true },
    administeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dateGiven: { type: Date, required: true },
    next_due_date: { type: Date },
    NUmberOfDose:{type:Number},
    status: {
      type: String,
      enum: ["On-Time", "Delayed", "Missed"],
      required: true,
    },
    remarks: { type: String },
  },
  { timestamps: true }
);

const VaccinationRecord = mongoose.model("VaccinationRecord", vaccinationRecordSchema);
module.exports = VaccinationRecord;
