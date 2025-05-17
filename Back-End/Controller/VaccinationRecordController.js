const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const VaccineRecord = require("../Models/VaccinationRecord");
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
    dosage,
  } = req.body;

  const missingFields = [];
  if (!newborn) missingFields.push("NewBorn");
  if (!vaccine) missingFields.push("Vaccine");
  if (!administeredBy) missingFields.push("AdministeredBy");
  if (!dateGiven) missingFields.push("Date Given");
  if (!dosage) missingFields.push("Dosage");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `The following fields are required: ${missingFields.join(", ")}`,
    });
  }

  const givenDate = new Date(dateGiven);

  // ✅ Find existing record
  let record = await VaccineRecord.findOne({ newborn, vaccine });

  // Get the previous dose's next_due_date (if any)
  let previousNextDueDate = null;
  if (record && record.doses.length > 0) {
    // Get the most recent dose
    const lastDose = record.doses[record.doses.length - 1];
    previousNextDueDate = lastDose.next_due_date;
  }

  // Determine status based on `next_due_date`
  let status = "On-Time";
  const dueDateToCompare = previousNextDueDate || next_due_date; // Compare with previous dose's `next_due_date` or provided `next_due_date`

  if (dueDateToCompare) {
    const diff = Math.floor((givenDate - new Date(dueDateToCompare)) / (1000 * 60 * 60 * 24));
    if (diff > 0 && diff <= 14) status = "Delayed";
    else if (diff > 14) status = "Missed";
  }

  const newDose = {
    doseNumber: record ? record.doses.length + 1 : 1,
    dateGiven,
    next_due_date,
    remarks,
    administeredBy,
    status,
    dosage,
  };

  if (!record) {
    // First record for this newborn + vaccine
    record = await VaccineRecord.create({
      newborn,
      vaccine,
      doses: [newDose],
    });
  } else {
    // Append new dose
    record.doses.push(newDose);
    await record.save();
  }

  // Return latest added dose with populated fields
  const latest = await VaccineRecord.aggregate([
    { $match: { _id: record._id } },
    {
      $unwind: {
        path: "$doses",
        includeArrayIndex: "doseIndex",
        preserveNullAndEmptyArrays: false,
      },
    },
    { $sort: { "doses.dateGiven": -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: "newborns",
        localField: "newborn",
        foreignField: "_id",
        as: "newborn",
      },
    },
    { $unwind: { path: "$newborn", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "vaccines",
        localField: "vaccine",
        foreignField: "_id",
        as: "vaccine",
      },
    },
    { $unwind: { path: "$vaccine", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "doses.administeredBy",
        foreignField: "_id",
        as: "administeredBy",
      },
    },
    { $unwind: { path: "$administeredBy", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "newborn.motherName",
        foreignField: "_id",
        as: "mother",
      },
    },
    { $unwind: { path: "$mother", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        dateGiven: "$doses.dateGiven",
        doseNumber: "$doses.doseNumber",
        remarks: "$doses.remarks",
        status: "$doses.status",
        dosage: "$doses.dosage",

        newbornName: {
          $concat: ["$newborn.firstName", " ", "$newborn.lastName"],
        },
        vaccineName: "$vaccine.name",
        description: "$vaccine.description",
        administeredBy: {
          $concat: [
            "$administeredBy.FirstName",
            " ",
            "$administeredBy.LastName",
          ],
        },
        motherName: {
          $concat: ["$mother.FirstName", " ", "$mother.LastName"],
        },
        FullAddress: {
          $concat: ["$mother.zone", " ", "$mother.address"],
        },
      },
    },
  ]);

  res.status(201).json({
    status: "success",
    data: latest[0],
  });
});


exports.DisplayVaccinationRecord = async (req, res) => {
  try {
    const records = await VaccineRecord.aggregate([
      // Lookup newborn details
      {
        $lookup: {
          from: "newborns",
          localField: "newborn",
          foreignField: "_id",
          as: "newborn",
        },
      },
      { $unwind: { path: "$newborn", preserveNullAndEmptyArrays: true } },

      // Lookup vaccine details
      {
        $lookup: {
          from: "vaccines",
          localField: "vaccine",
          foreignField: "_id",
          as: "vaccine",
        },
      },
      { $unwind: { path: "$vaccine", preserveNullAndEmptyArrays: true } },

      // Lookup administeredBy (user)
      {
        $lookup: {
          from: "users",
          localField: "administeredBy",
          foreignField: "_id",
          as: "administeredBy",
        },
      },
      {
        $unwind: { path: "$administeredBy", preserveNullAndEmptyArrays: true },
      },

      // Optional: Lookup mother (from newborn.motherName)
      {
        $lookup: {
          from: "users",
          localField: "newborn.motherName",
          foreignField: "_id",
          as: "mother",
        },
      },
      { $unwind: { path: "$mother", preserveNullAndEmptyArrays: true } },

      // Add status to each dose in doses array
      {
        $addFields: {
          doses: {
            $map: {
              input: "$doses",
              as: "dose",
              in: {
                $mergeObjects: [
                  "$$dose",
                  {
                    status: {
                      $cond: {
                        if: { $gt: ["$$dose.dateGiven", "$$dose.next_due_date"] },
                        then: "Delayed",
                        else: "On-Time",
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },

      // Final projection
      {
        $project: {
          // Newborn Info
          newbornName: {
            $concat: ["$newborn.firstName", " ", "$newborn.lastName"],
          },
          avatar: "$newborn.avatar", // No need to concat here

          // Vaccine Info
          vaccineName: "$vaccine.name",
          dosage: "$vaccine.dosage",
          description: "$vaccine.description",

          // Administered By
          administeredBy: {
            $concat: [
              "$administeredBy.FirstName",
              " ",
              "$administeredBy.LastName",
            ],
          },

          // Mother Info
          motherName: {
            $concat: ["$mother.FirstName", " ", "$mother.LastName"],
          },
          FullAddress: { $concat: ["$mother.zone", " ", "$mother.address"] },

          // Doses Array (keeping it intact)
          doses: 1, // Keeping doses as is

          // Additional Info: Direct reference to the newborn and vaccine fields
          newborn: 1,  // If you want the whole newborn object
          vaccine: 1,  // If you want the whole vaccine object
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
  const updatedRecord = await VaccineRecord.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  // Check if the record exists
  if (!updatedRecord) {
    return res.status(404).json({
      status: "fail",
      message: "Vaccination record not found.",
    });
  }

  // Aggregate updated record only
  const records = await VaccineRecord.aggregate([
    { $match: { _id: updatedRecord._id } }, // <-- tama na ito

    {
      $lookup: {
        from: "newborns",
        localField: "newborn",
        foreignField: "_id",
        as: "newborn",
      },
    },
    { $unwind: { path: "$newborn", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "vaccines",
        localField: "vaccine",
        foreignField: "_id",
        as: "vaccine",
      },
    },
    { $unwind: { path: "$vaccine", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "users",
        localField: "administeredBy",
        foreignField: "_id",
        as: "administeredBy",
      },
    },
    { $unwind: { path: "$administeredBy", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "users",
        localField: "newborn.motherName",
        foreignField: "_id",
        as: "mother",
      },
    },
    { $unwind: { path: "$mother", preserveNullAndEmptyArrays: true } },

    {
      $project: {
        dateGiven: 1,
        doseNumber: 1,
        remarks: 1,

        newbornName: {
          $concat: ["$newborn.firstName", " ", "$newborn.lastName"],
        },

        vaccineName: "$vaccine.name",
        dosage: "$vaccine.dosage",
        description: "$vaccine.description",

        administeredBy: {
          $concat: [
            "$administeredBy.FirstName",
            " ",
            "$administeredBy.LastName",
          ],
        },

        motherName: {
          $concat: ["$mother.FirstName", " ", "$mother.LastName"],
        },
        FullAddress: {
          $concat: ["$mother.zone", " ", "$mother.address"],
        },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: records[0], // return only the updated record details
  });
});


exports.deleteRecord = AsyncErrorHandler(async (req, res, next) => {
  await VaccineRecord.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    data: null,
  });
});
