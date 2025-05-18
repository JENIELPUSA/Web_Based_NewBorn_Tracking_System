const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const VaccineRecord = require("../Models/VaccinationRecord");
const Vaccine = require("./../Models/VaccineModel")
const CustomError = require("./../Utils/CustomError");
const Apifeatures = require("./../Utils/ApiFeatures");
const mongoose = require("mongoose");

exports.createNewRecord = AsyncErrorHandler(async (req, res) => {
  const {
    newborn,
    vaccine,
    administeredBy,
    next_due_date,
    remarks,
    dateGiven,
    status,
  } = req.body;

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
    .filter(batch => batch.stock > 0)
    .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));

  if (validBatches.length === 0) {
    return res.status(400).json({ message: "No available stock in any batch." });
  }

  const selectedBatch = validBatches[0];
  selectedBatch.stock -= 1;
  await vaccineDoc.save(); // Save stock update

  // Step 3: Create or update VaccineRecord
  let record = await VaccineRecord.findOne({ newborn, vaccine });

  const newDose = {
    doseNumber: record ? record.doses.length + 1 : 1,
    dateGiven: new Date(dateGiven),
    next_due_date,
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

    // Join newborn
    {
      $lookup: {
        from: "newborns",
        localField: "newborn",
        foreignField: "_id",
        as: "newborn",
      },
    },
    { $unwind: "$newborn" },

    // Join vaccine
    {
      $lookup: {
        from: "vaccines",
        localField: "vaccine",
        foreignField: "_id",
        as: "vaccine",
      },
    },
    { $unwind: "$vaccine" },

    // Join mother (user)
    {
      $lookup: {
        from: "users",
        localField: "newborn.motherName",
        foreignField: "_id",
        as: "mother",
      },
    },
    { $unwind: "$mother" },

    // Unwind doses to enrich each
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

    // Add full name of administeredBy
    {
      $addFields: {
        "doses.administeredBy": {
          $cond: {
            if: { $ifNull: ["$doseAdmin", false] },
            then: {
              $concat: ["$doseAdmin.FirstName", " ", "$doseAdmin.LastName"],
            },
            else: null,
          },
        },
      },
    },

    // Group back doses
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
      },
    },

    // Final shape
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

      // Add full name for administeredBy (status is already manually handled)
      {
        $addFields: {
          "doses.administeredBy": {
            $cond: {
              if: { $ifNull: ["$doseAdmin", false] },
              then: { $concat: ["$doseAdmin.FirstName", " ", "$doseAdmin.LastName"] },
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
        },
      },

      // Final projection
      {
        $project: {
          _id: 1,
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

    res.status(200).json({ status: "success", data: records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Something went wrong." });
  }
};

exports.UpdateRecord = AsyncErrorHandler(async (req, res, next) => {
  const { recordId, doseId } = req.params;

  // Validate ObjectIds
  if (!mongoose.isValidObjectId(recordId) || !mongoose.isValidObjectId(doseId)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid ID format - both recordId and doseId must be valid MongoDB ObjectIds"
    });
  }

  // Build update fields
  const updateFields = {};
  const validFields = ['dateGiven', 'next_due_date', 'remarks', 'status', 'administeredBy'];
  
  validFields.forEach(field => {
    if (req.body[field] !== undefined) {
      if (field === 'administeredBy') {
        if (!mongoose.isValidObjectId(req.body[field])) {
          return res.status(400).json({
            status: "fail",
            message: "Invalid administeredBy ID format"
          });
        }
      }
      updateFields[`doses.$.${field}`] = req.body[field];
    }
  });

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({
      status: "fail",
      message: "No valid fields provided for update"
    });
  }

  // Update dose
  const updated = await VaccineRecord.findOneAndUpdate(
    { _id: recordId, "doses._id": doseId },
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!updated) {
    return res.status(404).json({
      status: "fail",
      message: "Record or dose not found"
    });
  }

  // Aggregation to get updated dose
  const updatedDoseData = await VaccineRecord.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(recordId) } },
    { $unwind: "$doses" },
    { $match: { "doses._id": new mongoose.Types.ObjectId(doseId) } },

    // Lookup newborn
    {
      $lookup: {
        from: "newborns",
        localField: "newborn",
        foreignField: "_id",
        as: "newborn"
      }
    },
    { $unwind: "$newborn" },

    // Lookup vaccine
    {
      $lookup: {
        from: "vaccines",
        localField: "vaccine",
        foreignField: "_id",
        as: "vaccine"
      }
    },
    { $unwind: "$vaccine" },

    // Lookup administeredBy
    {
      $lookup: {
        from: "users",
        localField: "doses.administeredBy",
        foreignField: "_id",
        as: "doseAdmin"
      }
    },
    { $unwind: { path: "$doseAdmin", preserveNullAndEmptyArrays: true } },

    {
      $addFields: {
        "doses.administeredBy": {
          $cond: {
            if: { $ifNull: ["$doseAdmin", false] },
            then: { $concat: ["$doseAdmin.FirstName", " ", "$doseAdmin.LastName"] },
            else: null
          }
        }
      }
    },

    {
      $project: {
        dose: "$doses",
        recordId: "$_id",
        newbornName: { $concat: ["$newborn.firstName", " ", "$newborn.lastName"] },
        avatar: "$newborn.avatar",
        vaccineName: "$vaccine.name",
        dosage: "$vaccine.dosage",
        description: "$vaccine.description"
      }
    }
  ]);

  if (updatedDoseData.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "Failed to retrieve updated dose information"
    });
  }

  res.status(200).json({
    status: "success",
    data: updatedDoseData[0]
  });
});



exports.deleteRecord = AsyncErrorHandler(async (req, res, next) => {
  const { recordId, doseId } = req.params;

  // 1. Validate both IDs
  if (!mongoose.isValidObjectId(recordId) || !mongoose.isValidObjectId(doseId)) {
    return res.status(400).json({
      status: "fail",
      message: "Invalid ID format - both IDs must be 24-character hex strings"
    });
  }

  // 2. Check if dose exists before deletion
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

  // 3. Remove the specific dose
  const updatedRecord = await VaccineRecord.findByIdAndUpdate(
    recordId,
    {
      $pull: { doses: { _id: doseId } }
    },
    { new: true }
  );

  // 4. Verify deletion
  if (!updatedRecord || updatedRecord.doses.some(dose => dose._id.toString() === doseId)) {
    return res.status(500).json({
      status: "error",
      message: "Failed to delete dose"
    });
  }

    // 5. Check if doses array is now empty, delete entire record
  if (updatedRecord.doses.length === 0) {
    await VaccineRecord.findByIdAndDelete(recordId);
    return res.status(200).json({
      status: "success",
      message: "Dose deleted and record removed because no doses remain."
    });
  }


  // 5. Success response
  res.status(200).json({
    status: "success",
    data: null
  });
});
