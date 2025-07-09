const mongoose = require('mongoose');
const CheckupRecordSchema = new mongoose.Schema({
  newborn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Newborn',
    required: true
  },
  visitDate: {
    type: Date,
    default: Date.now
  },
  weight: Number,
  height: Number,
  health_condition: String,
  notes: String,
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CheckupRecord', CheckupRecordSchema);
