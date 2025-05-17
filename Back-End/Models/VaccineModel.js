const mongoose = require("mongoose");

const vaccineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  dosage: String, // e.g., "0.5 mL", "10 mcg"
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }, // <- Reference to Brand
  zone: String,
  batches: [
    {
      stock: { type: Number, required: true },
      expirationDate: { type: Date, required: true },
      addedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

const Vaccine = mongoose.model("Vaccine", vaccineSchema);
module.exports = Vaccine;
