const mongoose = require('mongoose');
const Equipment = require('./../Models/Equipment');

// Define the category schema
const categorySchema = new mongoose.Schema({
    Laboratory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Laboratory',  // Reference to the Laboratory model
      },
    Equipments: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment',  // Reference to the Equipment model
        required: true
    }
});

// Pre-hook for validating equipment availability before saving
categorySchema.pre('save', async function (next) {
    if (this.Equipments && this.Equipments.length > 0) {
        const equipmentIds = this.Equipments;

        console.log('Validating Equipments:', equipmentIds);

        try {
            // Check if any of the equipment is already assigned to a different laboratory
            const alreadyAssignedEquipments = await Equipment.find({
                _id: { $in: equipmentIds },
                status: 'Not Available'  // Equipment already assigned
            });

            if (alreadyAssignedEquipments.length > 0) {
                const assignedEquipmentNames = alreadyAssignedEquipments.map(e => e.name).join(', ');
                const errorMessage = `The following equipment is already assigned and cannot be reassigned: ${assignedEquipmentNames}`;
                console.error(errorMessage);
                return next(new Error(errorMessage));  // Stop the save operation and pass the error
            }

            // Proceed if no equipment is already assigned to another laboratory
            console.log('All equipment is available for assignment.');

            next();  // Proceed to the save operation
        } catch (error) {
            console.error('Error during equipment validation:', error);
            return next(error);  // Pass the error to the next middleware
        }
    } else {
        console.log('No Equipments to validate.');
        next();  // Proceed if no equipment to validate
    }
});

// Post-hook for updating equipment status after saving the assignment
categorySchema.post('save', async function (doc, next) {
    if (doc.Laboratory && doc.Equipments && doc.Equipments.length > 0) {
        const equipmentIds = doc.Equipments;

        console.log('Updating status for Equipments:', equipmentIds);

        try {
            // Update the status of all equipment to "Not Available"
            await Equipment.updateMany(
                { _id: { $in: equipmentIds }, status: { $ne: 'Not Available' } },
                { $set: { status: 'Not Available' } }
            );
            console.log('Successfully updated status to "Not Available" for Equipments!');
        } catch (error) {
            console.error('Error updating Equipment status:', error);
            return next(error);  // Pass the error to the next middleware
        }
    } else {
        console.log('No Laboratory assigned or no Equipments to update.');
    }

    next();
});

// Post-hook for updating equipment status after deleting the assignment
categorySchema.post('findOneAndDelete', async function (doc, next) {
    if (doc && doc.Laboratory && doc.Equipments && doc.Equipments.length > 0) {
        const equipmentIds = doc.Equipments;

        console.log('Reverting status for Equipments:', equipmentIds);

        try {
            // Update the status of all equipment to "Available"
            await Equipment.updateMany(
                { _id: { $in: equipmentIds }, status: { $ne: 'Available' } },
                { $set: { status: 'Available' } }
            );
            console.log('Successfully retrieved the Equipment!');
        } catch (error) {
            console.error('Error updating Equipment status:', error);
            return next(error);  // Pass the error to the next middleware
        }
    } else {
        console.log('No Laboratory assigned or no Equipments to update.');
    }

    next();
});

const Assign = mongoose.model('Assign', categorySchema);

module.exports = Assign;
