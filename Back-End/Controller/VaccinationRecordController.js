const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const VaccineRecord = require("../Models/VaccinationRecord");
const Vaccine = require("./../Models/VaccineModel")
const CustomError = require("./../Utils/CustomError");
const Apifeatures = require("./../Utils/ApiFeatures");
const mongoose = require("mongoose");
const AuditLog=require("./../Models/LogAndAudit")
const getClientIp = require("./../Utils/getClientIp");

exports.createNewRecord = AsyncErrorHandler(async (req, res) => {
  const {
    newborn,
    vaccine,
    administeredBy,
    remarks,
    dateGiven,
    next_due_date, // Optional field included
    status,
  } = req.body;

  const userId = req.user._id;
  const ipAddress = getClientIp(req);

  // Step 1: Validate required fields
  const missingFields = [];
  if (!newborn) missingFields.push("NewBorn");
  if (!vaccine) missingFields.push("Vaccine");
  if (!administeredBy) missingFields.push("Administered By");
  if (!dateGiven) missingFields.push("Date Given");
  if (!status) missingFields.push("Status");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `The following fields are required: ${missingFields.join(", ")}`,
    });
  }

  // Step 2: Fetch vaccine and determine batch to use
  const vaccineDoc = await Vaccine.findById(vaccine);
  if (!vaccineDoc) {
    return res.status(404).json({ message: "Vaccine not found" });
  }

  const validBatches = vaccineDoc.batches
    .filter((batch) => batch.stock > 0)
    .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));

  if (validBatches.length === 0) {
    return res.status(400).json({ message: "No available stock in any batch." });
  }

  const selectedBatch = validBatches[0];
  selectedBatch.stock -= 1;
  await vaccineDoc.save();

  // Step 3: Create or update VaccineRecord
  let record = await VaccineRecord.findOne({ newborn, vaccine });

  // Construct newDose with optional next_due_date
  const newDose = {
    doseNumber: record ? record.doses.length + 1 : 1,
    dateGiven: new Date(dateGiven),
    ...(next_due_date && { next_due_date: new Date(next_due_date) }), // Optional
    remarks,
    administeredBy,
    status,
    expirationDateUsed: selectedBatch.expirationDate,
  };

  if (!record) {
    record = await VaccineRecord.create({
      newborn,
      vaccine,
      doses: [newDose],
    });
  } else {
    record.doses.push(newDose);
    await record.save();
  }

  // Step 4: Aggregate and return populated record
  const populatedRecord = await VaccineRecord.aggregate([
    { $match: { _id: record._id } },
    {
      $lookup: {
        from: "newborns",
        localField: "newborn",
        foreignField: "_id",
        as: "newborn",
      },
    },
    { $unwind: "$newborn" },
    {
      $lookup: {
        from: "vaccines",
        localField: "vaccine",
        foreignField: "_id",
        as: "vaccine",
      },
    },
    { $unwind: "$vaccine" },
    {
      $lookup: {
        from: "users",
        localField: "newborn.motherName",
        foreignField: "_id",
        as: "mother",
      },
    },
    { $unwind: "$mother" },
    { $unwind: "$doses" },
    {
      $lookup: {
        from: "users",
        localField: "doses.administeredBy",
        foreignField: "_id",
        as: "doseAdmin",
      },
    },
    {
      $unwind: {
        path: "$doseAdmin",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        "doses.administeredByName": {
          $cond: {
            if: { $ifNull: ["$doseAdmin", false] },
            then: {
              $concat: ["$doseAdmin.FirstName", " ", "$doseAdmin.LastName"],
            },
            else: null,
          },
        },
        "doses.administeredById": "$doseAdmin._id",
      },
    },
    {
      $group: {
        _id: "$_id",
        doses: { $push: "$doses" },
        newbornName: {
          $first: { $concat: ["$newborn.firstName", " ", "$newborn.lastName"] },
        },
        avatar: { $first: "$newborn.avatar" },
        vaccineName: { $first: "$vaccine.name" },
        dosage: { $first: "$vaccine.dosage" },
        description: { $first: "$vaccine.description" },
        motherName: {
          $first: { $concat: ["$mother.FirstName", " ", "$mother.LastName"] },
        },
        FullAddress: {
          $first: { $concat: ["$mother.zone", " ", "$mother.address"] },
        },
      },
    },
    {
      $project: {
        recordId: "$_id",
        doses: 1,
        newbornName: 1,
        avatar: 1,
        vaccineName: 1,
        dosage: 1,
        description: 1,
        motherName: 1,
        FullAddress: 1,
      },
    },
  ]);

  if (!populatedRecord.length) {
    return res.status(404).json({
      message: "No record found or dose could not be added.",
    });
  }

  const latestDose = populatedRecord[0].doses[populatedRecord[0].doses.length - 1];

  // Step 5: Create audit log
  const auditLog = new AuditLog({
    userId,
    action: "Assigned Vaccine",
    module: "assigned-vaccine",
    targetId: record._id,
    description: `Created dose #${latestDose.doseNumber} of vaccine "${populatedRecord[0].vaccineName}" for ${populatedRecord[0].newbornName}`,
    details: {
      newbornName: populatedRecord[0].newbornName,
      vaccineName: populatedRecord[0].vaccineName,
      doseNumber: latestDose.doseNumber,
      administeredBy: latestDose.administeredByName || "Unknown",
    },
    ipAddress,
  });

  await auditLog.save();

  res.status(201).json({
    status: "success",
    data: populatedRecord[0],
  });
});




exports.DisplayVaccinationRecord = async (req, res) => {
  try {
    const records = await VaccineRecord.aggregate([
      // Lookup newborn
      {
        $lookup: {
          from: "newborns",
          localField: "newborn",
          foreignField: "_id",
          as: "newborn",
        },
      },
      { $unwind: "$newborn" },

      // Lookup vaccine
      {
        $lookup: {
          from: "vaccines",
          localField: "vaccine",
          foreignField: "_id",
          as: "vaccine",
        },
      },
      { $unwind: "$vaccine" },

      // Lookup mother
      {
        $lookup: {
          from: "users",
          localField: "newborn.motherName",
          foreignField: "_id",
          as: "mother",
        },
      },
      { $unwind: "$mother" },

      // Unwind doses to operate individually
      { $unwind: "$doses" },

      // Lookup administeredBy for each dose
      {
        $lookup: {
          from: "users",
          localField: "doses.administeredBy",
          foreignField: "_id",
          as: "doseAdmin",
        },
      },
      {
        $unwind: { path: "$doseAdmin", preserveNullAndEmptyArrays: true },
      },

      // Separate full name and ID for administeredBy
      {
        $addFields: {
          "doses.administeredBy": {
            $cond: {
              if: { $ifNull: ["$doseAdmin", false] },
              then: { $concat: ["$doseAdmin.FirstName", " ", "$doseAdmin.LastName"] },
              else: null,
            },
          },
          "doses.administeredById": {
            $cond: {
              if: { $ifNull: ["$doseAdmin", false] },
              then: "$doseAdmin._id",
              else: null,
            },
          },
           "doses.zone": {
            $cond: {
              if: { $ifNull: ["$doseAdmin", false] },
              then: "$doseAdmin.zone",
              else: null,
            },
          },
        },
      },

      // Group by VaccineRecord _id instead of batch
      {
        $group: {
          _id: "$_id",
          doses: { $push: "$doses" },
          newbornName: { $first: { $concat: ["$newborn.firstName", " ", "$newborn.lastName"] } },
          avatar: { $first: "$newborn.avatar" },
          vaccineName: { $first: "$vaccine.name" },
          dosage: { $first: "$vaccine.dosage" },
          description: { $first: "$vaccine.description" },
          motherName: { $first: { $concat: ["$mother.FirstName", " ", "$mother.LastName"] } },
          FullAddress: { $first: { $concat: ["$mother.zone", " ", "$mother.address"] } },
                    newbornZone: { $first: "$mother.zone" },
  
        },
      },

      // Final projection
      {
        $project: {
          _id: 1,
          recordId: "$_id",
          doses: 1, // This will include the dose data with separated full name and ID for administeredBy
          newbornName: 1,
          avatar: 1,
          vaccineName: 1,
          dosage: 1,
          description: 1,
          motherName: 1,
          FullAddress: 1,
          newbornZone:1
        },  
      },
    ]);

    res.status(200).json({ status: "success", data: records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Something went wrong." });
  }
};


exports.UpdateRecord = AsyncErrorHandler(async (req, res, next) => {
  const { recordId, doseId } = req.params;
  const ipAddress = getClientIp(req);
  const userId = req.user._id;

  // Validate ObjectIds
  if (!mongoose.isValidObjectId(recordId) || !mongoose.isValidObjectId(doseId)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid ID format - both recordId and doseId must be valid MongoDB ObjectIds",
    });
  }

  // Fetch the record before update (for audit trail)
  const existingRecord = await VaccineRecord.findOne(
    { _id: recordId, "doses._id": doseId },
    { "doses.$": 1 }
  );

  if (!existingRecord) {
    return res.status(404).json({
      status: "fail",
      message: "Record or dose not found",
    });
  }

  const beforeUpdate = existingRecord.doses[0].toObject();

  // Build update fields (exclude 'administeredBy')
  const updateFields = {};
  const validFields = ['dateGiven', 'next_due_date', 'remarks', 'status'];

  for (const field of validFields) {
    if (req.body[field] !== undefined) {
      updateFields[`doses.$.${field}`] = req.body[field];
    }
  }

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({
      status: "fail",
      message: "No valid fields provided for update",
    });
  }

  // Perform the update
  const updatedRecord = await VaccineRecord.findOneAndUpdate(
    { _id: recordId, "doses._id": doseId },
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!updatedRecord) {
    return res.status(404).json({
      status: "fail",
      message: "Record or dose not found after update",
    });
  }

  // Aggregate updated dose info
  const updatedDoseData = await VaccineRecord.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(recordId) } },
    { $unwind: "$doses" },
    { $match: { "doses._id": new mongoose.Types.ObjectId(doseId) } },

    {
      $lookup: {
        from: "newborns",
        localField: "newborn",
        foreignField: "_id",
        as: "newborn",
      },
    },
    { $unwind: "$newborn" },

    {
      $lookup: {
        from: "vaccines",
        localField: "vaccine",
        foreignField: "_id",
        as: "vaccine",
      },
    },
    { $unwind: "$vaccine" },

    {
      $lookup: {
        from: "users",
        localField: "doses.administeredBy",
        foreignField: "_id",
        as: "doseAdmin",
      },
    },
    {
      $unwind: {
        path: "$doseAdmin",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $addFields: {
        "doses.administeredByName": {
          $cond: {
            if: { $ifNull: ["$doseAdmin", false] },
            then: { $concat: ["$doseAdmin.FirstName", " ", "$doseAdmin.LastName"] },
            else: null,
          },
        },
        "doses.administeredById": "$doseAdmin._id",
      },
    },

    {
      $project: {
        dose: "$doses",
        recordId: "$_id",
        newbornName: { $concat: ["$newborn.firstName", " ", "$newborn.lastName"] },
        avatar: "$newborn.avatar",
        vaccineName: "$vaccine.name",
        dosage: "$vaccine.dosage",
        description: "$vaccine.description",
        administeredById: "$dose.administeredById",
        administeredByName: "$dose.administeredByName",
      },
    },
  ]);

  if (updatedDoseData.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "Failed to retrieve updated dose information",
    });
  }

  const updatedDose = updatedDoseData[0];

  // Create audit log
  const auditLog = new AuditLog({
    userId: userId,
    action: "Update Assign Vaccination",
    module: "assigned-vaccine",
    targetId: updatedDose.recordId,
    description: `Updated dose #${updatedDose.dose.doseNumber} of vaccine "${updatedDose.vaccineName}" for ${updatedDose.newbornName}`,
    details: {
      before: beforeUpdate,
      after: updatedDose.dose,
      newbornName: updatedDose.newbornName,
      vaccineName: updatedDose.vaccineName,
      doseNumber: updatedDose.dose.doseNumber,
      administeredBy: updatedDose.administeredByName || "Unknown",
    },
    ipAddress,
  });

  await auditLog.save();

  res.status(200).json({
    status: "success",
    data: updatedDose,
  });
});






exports.deleteRecord = AsyncErrorHandler(async (req, res, next) => {
  const { recordId, doseId } = req.params;
 const userId = req.user._id;
   const ipAddress = getClientIp(req);

  if (!mongoose.isValidObjectId(recordId) || !mongoose.isValidObjectId(doseId)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid ID format - both IDs must be 24-character hex strings"
    });
  }

  const recordExists = await VaccineRecord.findOne({
    _id: recordId,
    "doses._id": doseId
  });

  if (!recordExists) {
    return res.status(404).json({
      status: "fail",
      message: "No matching record or dose found"
    });
  }

  // Find the dose being deleted (for audit logging)
  const doseToDelete = recordExists.doses.find(d => d._id.toString() === doseId);

  //Delete the dose
  const updatedRecord = await VaccineRecord.findByIdAndUpdate(
    recordId,
    { $pull: { doses: { _id: doseId } } },
    { new: true }
  );

  if (!updatedRecord || updatedRecord.doses.some(dose => dose._id.toString() === doseId)) {
    return res.status(500).json({
      status: "error",
      message: "Failed to delete dose"
    });
  }

  // 🗑 If no more doses, delete the whole record
  if (updatedRecord.doses.length === 0) {
    await VaccineRecord.findByIdAndDelete(recordId);

    // 📋 Audit log for full record deletion
    const auditLog = new AuditLog({
      userId: userId,
      action: "DELETE",
      module: "assigned-vaccine",
      targetId: recordId,
      description: `Deleted last dose, entire vaccine record removed`,
      details: {
        deletedDose: doseToDelete,
        after: "No remaining doses"
      },
      ipAddress: ipAddress || req.ip
    });

    await auditLog.save();

    return res.status(200).json({
      status: "success",
      message: "Dose deleted and record removed because no doses remain."
    });
  }

  // Aggregate the updated record for return and logging
  const populatedRecord = await VaccineRecord.aggregate([
    { $match: { _id: updatedRecord._id } },
    { $lookup: { from: "newborns", localField: "newborn", foreignField: "_id", as: "newborn" } },
    { $unwind: "$newborn" },
    { $lookup: { from: "vaccines", localField: "vaccine", foreignField: "_id", as: "vaccine" } },
    { $unwind: "$vaccine" },
    { $lookup: { from: "users", localField: "newborn.motherName", foreignField: "_id", as: "mother" } },
    { $unwind: "$mother" },
    { $unwind: "$doses" },
    { $lookup: { from: "users", localField: "doses.administeredBy", foreignField: "_id", as: "doseAdmin" } },
    {
      $unwind: {
        path: "$doseAdmin",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        "doses.administeredByName": {
          $cond: {
            if: { $ifNull: ["$doseAdmin", false] },
            then: { $concat: ["$doseAdmin.FirstName", " ", "$doseAdmin.LastName"] },
            else: null
          }
        },
        "doses.administeredById": "$doseAdmin._id"
      }
    },
    {
      $group: {
        _id: "$_id",
        doses: { $push: "$doses" },
        newbornName: { $first: { $concat: ["$newborn.firstName", " ", "$newborn.lastName"] } },
        avatar: { $first: "$newborn.avatar" },
        vaccineName: { $first: "$vaccine.name" },
        dosage: { $first: "$vaccine.dosage" },
        description: { $first: "$vaccine.description" },
        motherName: { $first: { $concat: ["$mother.FirstName", " ", "$mother.LastName"] } },
        FullAddress: { $first: { $concat: ["$mother.zone", " ", "$mother.address"] } }
      }
    },
    {
      $project: {
        recordId: "$_id",
        doses: 1,
        newbornName: 1,
        avatar: 1,
        vaccineName: 1,
        dosage: 1,
        description: 1,
        motherName: 1,
        FullAddress: 1
      }
    }
  ]);

  if (!populatedRecord.length) {
    return res.status(404).json({
      status: "fail",
      message: "Record or doses not found after deletion"
    });
  }

  const result = populatedRecord[0];
  const latestDose = result.doses[result.doses.length - 1];

  // Audit log with before & after
  const auditLog = new AuditLog({
    userId: userId,
    action: "Delete Assign Vaccination",
    module: "assigned-vaccine",
    targetId: updatedRecord._id,
    description: `Deleted dose #${doseToDelete.doseNumber} of vaccine "${result.vaccineName}" for ${result.newbornName}`,
    details: {
      newbornName: result.newbornName,
      vaccineName: result.vaccineName,
      before: doseToDelete,
      after: result.doses.map(d => ({
        doseNumber: d.doseNumber,
        dateGiven: d.dateGiven,
        status: d.status
      }))
    },
    ipAddress: ipAddress 
  });

  await auditLog.save();

  res.status(200).json({
    status: "success",
    data: result
  });
});


