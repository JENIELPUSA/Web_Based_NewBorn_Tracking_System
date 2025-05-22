const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Relates to the User collection
    required: true 
  },
  action: { 
    type: String, 
    required: true // Action performed (e.g., DELETE, UPDATE, CREATE)
  },
  module: { 
    type: String, 
    required: true // Module (e.g., vaccine, newborn, user)
  },
  targetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, // ID of the affected entity (e.g., vaccineId, newbornId)
    refPath: 'module' // Dynamically references the correct collection based on 'module'
  },
  description: { 
    type: String, 
    required: true // Description of the action (e.g., 'Deleted vaccine record')
  },
  details: { 
    type: Object, 
    default: {} // Optional: store additional details like before/after values
  },
  timestamp: { 
    type: Date, 
    default: Date.now // Timestamp of when the action occurred
  },
  ipAddress: { 
    type: String, 
    required: true // IP address from which the action was performed
  }
});

// Create and export the model
module.exports = mongoose.model('AuditLog', auditLogSchema);
