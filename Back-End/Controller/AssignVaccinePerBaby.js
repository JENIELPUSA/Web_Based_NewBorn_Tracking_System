const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const AssignedVaccineSchema = require("../Models/AssignedVaccineSchema");
const VaccinationRecord = require("../Models/VaccineModel");

exports.createPerAssigned = AsyncErrorHandler(async (req, res) => {
  const { vaccine, totalDoses, completed, newborn } = req.body;

  // Step 1: Validate required fields
  if (!vaccine) {
    return res.status(400).json({
      status: "error",
      message: "Please Select a Vaccine",
    });
  }

  // Step 2: Check if same vaccine is already assigned to the same newborn
  const existingAssignment = await AssignedVaccineSchema.findOne({
    vaccine,
    newborn,
  });

  if (existingAssignment) {
    return res.status(400).json({
      status: "error",
      message: "This vaccine is already assigned to this newborn.",
    });
  }

  // Step 3: Create new assignment
  const assignedVaccine = await AssignedVaccineSchema.create({
    vaccine,
    newborn,
    totalDoses,
    completed: completed || false,
  });

  // Step 4: Check doses from vaccination record
  const vaccinationRecord = await VaccinationRecord.findOne({
    vaccine,
    newborn,
  }).populate("vaccine", "name");

  const dosesGiven = vaccinationRecord?.doses?.length || 0;

  let status = "Incomplete";
  if (dosesGiven === 0) status = "Pending";
  else if (dosesGiven >= totalDoses) status = "Completed";

  // Step 5: Response
  res.status(201).json({
    status: "success",
    data: {
      assignmentId: assignedVaccine._id,
      vaccineName: vaccinationRecord?.vaccine?.name || "Unknown Vaccine",
      totalDoses,
      dosesGiven,
      status,
      newbornId: newborn,
    },
  });
});

exports.displayAssignedVaccines = AsyncErrorHandler(async (req, res) => {
  const assignedVaccines = await AssignedVaccineSchema.aggregate([
    {
      $lookup: {
        from: "vaccines",
        localField: "vaccine",
        foreignField: "_id",
        as: "vaccineDetails",
      },
    },
    {
      $unwind: {
        path: "$vaccineDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "vaccinationrecords",
        let: { newbornId: "$newborn", vaccineId: "$vaccine" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$newborn", "$$newbornId"] },
                  { $eq: ["$vaccine", "$$vaccineId"] },
                ],
              },
            },
          },
        ],
        as: "vaccinationRecordDetails",
      },
    },
    {
      $unwind: {
        path: "$vaccinationRecordDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1, // Include AssignedVaccine _id
        newborn: 1,
        vaccine: 1,
        vaccineName: "$vaccineDetails.name",
        description: "$vaccineDetails.description",
        totalDoses: 1,
        dosesGiven: {
          $cond: {
            if: { $isArray: "$vaccinationRecordDetails.doses" },
            then: { $size: "$vaccinationRecordDetails.doses" },
            else: 0,
          },
        },
        status: {
          $switch: {
            branches: [
              {
                case: {
                  $gt: [
                    {
                      $size: {
                        $ifNull: ["$vaccinationRecordDetails.doses", []],
                      },
                    },
                    "$totalDoses",
                  ],
                },
                then: "Overdose",
              },
              {
                case: {
                  $eq: [
                    {
                      $size: {
                        $ifNull: ["$vaccinationRecordDetails.doses", []],
                      },
                    },
                    "$totalDoses",
                  ],
                },
                then: "Completed",
              },
              {
                case: {
                  $eq: [
                    {
                      $size: {
                        $ifNull: ["$vaccinationRecordDetails.doses", []],
                      },
                    },
                    0,
                  ],
                },
                then: "Pending",
              },
            ],
            default: "Incomplete",
          },
        },
      },
    },
    {
      $group: {
        _id: {
          assignedVaccineId: "$_id", // 👈 Group by assigned vaccine _id
          newborn: "$newborn",
          vaccine: "$vaccine",
          vaccineName: "$vaccineName",
          description: "$description",
          totalDoses: "$totalDoses",
        },
        assignedVaccineId: { $first: "$_id" },
        newborn: { $first: "$newborn" },
        vaccine: { $first: "$vaccine" },
        vaccineName: { $first: "$vaccineName" },
        description: { $first: "$description" },
        totalDoses: { $first: "$totalDoses" },
        dosesGiven: { $first: "$dosesGiven" },
        status: { $first: "$status" },
      },
    },
    {
      $project: {
        _id: 0,
        assignedVaccineId: 1,
        newborn: 1,
        vaccine: 1,
        vaccineName: 1,
        description: 1,
        totalDoses: 1,
        dosesGiven: 1,
        status: 1,
      },
    },
  ]);

  if (!assignedVaccines || assignedVaccines.length === 0) {
    return res.status(404).json({
      status: "error",
      message: "Walang assigned vaccine na nahanap.",
    });
  }

  res.status(200).json({
    status: "success",
    data: assignedVaccines,
  });
});

exports.DeleteAssignVaccines = AsyncErrorHandler(async (req, res) => {
  await AssignedVaccineSchema.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.UpdateAssignVaccine = AsyncErrorHandler(async (req, res, next) => {
  const { totalDoses } = req.body;
  const missingFields = [];

  // Check if any required fields are missing
  if (!totalDoses) missingFields.push("Total Doses");

  // ❗ ADD THIS CHECK:
  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "fail",
      message: "Missing required fields",
      missingFields,
    });
  }

  const updateVaccine = await AssignedVaccineSchema.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updateVaccine) {
    return res.status(404).json({
      status: "fail",
      message: "Baby data not found",
    });
  }
  res.status(200).json({
    status: "success",
    data: updateVaccine, // Assuming you only expect one result from aggregation
  });
});
