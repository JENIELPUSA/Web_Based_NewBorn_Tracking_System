const mongoose = require('mongoose');

const ProfilingSchema = new mongoose.Schema({
  newborn_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Newborn',
    required: true,
    unique:true
  },
  blood_type: {
    type: String,
    enum: ['A+', 'B+', 'AB+', 'O+','A-', 'B-', 'AB-', 'O-'],
    required: true
  },
  health_condition: {
    type: String,
    required: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true // optional: adds createdAt and updatedAt
});

module.exports = mongoose.model('Profiling', ProfilingSchema);
