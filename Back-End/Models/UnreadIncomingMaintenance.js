const mongoose = require('mongoose');
const RequestMaintenance = require('../Models/RequestMaintenance');  // Correctly reference the model

// Define the MaintenanceRequest schema
const IncomingMaintenanceRequestSchema = new mongoose.Schema({
    DateTime: {
        type: String,
        default: () => new Date(), // Automatically set current date and time
      },
    Description: {
    type: String,
    required: [true, 'Please enter a description.'], // Description is required
  },

  Equipments: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment', // Reference to the Equipment model
    required: true,
    unique:true
  },

  Department: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Departmentmodel', // Reference to the Department model
      required: true,
    },
  ],

  Laboratory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Laboratory', // Reference to the Laboratory model
      required: true,
    },
  ],
},{timestamps:true});

// Pre-save hook to check for duplicate maintenance requests within 24 hours
IncomingMaintenanceRequestSchema.pre('save', async function (next) {
  const equipmentId = this.Equipments; // Access the Equipments field from the document being saved

  // Get the current date and subtract 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Check if a maintenance request for the same equipment exists within the last 24 hours
  const existingRequest = await RequestMaintenance.findOne({
    Equipments: equipmentId,
    createdAt: { $gte: twentyFourHoursAgo }, // Filter by createdAt in the last 24 hours
  });

  if (existingRequest) {
    // If a duplicate is found, throw an error
    const error = new Error('Duplicate request: This equipment already has a maintenance request in the last 24 hours.');
    next(error); // Pass the error to the next middleware, which will handle it
  } else {
    // No duplicate found, proceed with saving the document
    next();
  }
});
const IncomingMaintenance = mongoose.model('IncomingMaintenance', IncomingMaintenanceRequestSchema);

module.exports = IncomingMaintenance;
