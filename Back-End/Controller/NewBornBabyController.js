const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const NewBaby = require("../Models/NewBornmodel");
const CustomError = require("./../Utils/CustomError");
const Apifeatures = require("./../Utils/ApiFeatures");
const mongoose = require("mongoose");
const AuditLog=require("./../Models/LogAndAudit")
const getClientIp = require("./../Utils/getClientIp");

exports.createNewRecord = AsyncErrorHandler(async (req, res) => {
  const { firstName, lastName, dateOfBirth, gender, birthWeight, motherName, birthHeight } = req.body;
  const ipAddress = getClientIp(req); // get client IP
  const userId = req.user._id; // the admin or user creating this record

  const missingFields = [];

  if (!firstName) missingFields.push("First Name");
  if (!lastName) missingFields.push("Last Name");
  if (!birthWeight) missingFields.push("Birth Weight");
  if (!motherName) missingFields.push("Mother Name");
  if (!dateOfBirth) missingFields.push("Date Of Birth");
  if (!gender) missingFields.push("Gender");
  if (!birthHeight) missingFields.push("Birth Height");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `The following fields are required: ${missingFields.join(", ")}`,
    });
  }

  const newData = await NewBaby.create(req.body);

  if (!newData) {
    return res.status(400).json({
      status: "fail",
      message: "Newborn creation failed.",
    });
  }

  const toolWithCategory = await NewBaby.aggregate([
    { $match: { _id: newData._id } },
    {
      $lookup: {
        from: "users",
        localField: "addedBy",
        foreignField: "_id",
        as: "addedBy",
      },
    },
    { $unwind: "$addedBy" },
    {
      $lookup: {
        from: "users",
        localField: "motherName",
        foreignField: "_id",
        as: "motherName",
      },
    },
    { $unwind: "$motherName" },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        middleName: 1,
        dateOfBirth: {
          $dateToString: { format: "%b %d %Y", date: "$dateOfBirth" },
        },
        gender: 1,
        birthWeight: 1,
        birthHeight: 1,
        motherName: {
          $concat: ["$motherName.FirstName", " ", "$motherName.LastName"],
        },
        address: {
          $concat: ["$motherName.zone", " ", "$motherName.address"],
        },
        createdAt: 1,
        addedByName: {
          $concat: ["$addedBy.FirstName", " ", "$addedBy.LastName"],
        },
        fullName: {
          $concat: ["$firstName", " ", "$middleName", " ", "$lastName"],
        },
      },
    },
  ]);

  const newbornData = toolWithCategory[0];

  // Create Audit Log entry
  const auditLog = new AuditLog({
    userId: userId,
    action: "Create Newborn Record",
    module: "newborn",
    targetId: newData._id,
    description: `Created newborn record for ${newbornData.fullName}`,
    details: {
      fullName: newbornData.fullName,
      gender: newbornData.gender,
      dateOfBirth: newbornData.dateOfBirth,
      mother: newbornData.motherName,
      birthWeight: newbornData.birthWeight,
      birthHeight: newbornData.birthHeight,
    },
    ipAddress,
  });

  await auditLog.save();

  res.status(201).json({
    status: "success",
    data: newbornData,
  });
});


exports.DisplayAllData = AsyncErrorHandler(async (req, res) => {
  // Apply filters, sorting, limiting, and pagination
  const features = new Apifeatures(NewBaby.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Get IDs after filtering and pagination
  const filteredBabies = await features.query;
  const ids = filteredBabies.map((baby) => baby._id);

  // Perform aggregation with $lookup, $project, and gender counting
  const result = await NewBaby.aggregate([
    {
      $match: { _id: { $in: ids } },
    },
    {
      $lookup: {
        from: "users", // Join with 'users' collection
        localField: "addedBy", // Reference to the 'addedBy' field in NewBaby schema
        foreignField: "_id", // Match with '_id' in 'users'
        as: "addedBy", // Output the matched user data into the 'addedBy' field
      },
    },
    {
      $unwind: {
        path: "$addedBy", // Unwind the 'addedBy' array to access user details
        preserveNullAndEmptyArrays: true, // Preserve documents even if 'addedBy' is missing
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "motherName",
        foreignField: "_id",
        as: "motherName",
      },
    },
    { $unwind: "$motherName" },
    {
      $project: {
        firstName: 1,
        middleName: 1,
        lastName: 1,
        dateOfBirth: {
          $dateToString: {
            format: "%b %d %Y", // Format date as 'Jan 13 2025'
            date: "$dateOfBirth",
          },
        },
        gender: 1, // Include gender for filtering
        birthWeight: 1,
        birthHeight: 1,
        motherName: {
          $concat: ["$motherName.FirstName", " ", "$motherName.LastName"],
        },
        motherID:"$motherName._id",
        address: {
          $concat: ["$motherName.zone", " ", "$motherName.address"],
        },
        phoneNumber: {
          $concat: ["$motherName.phoneNumber"],
        },
        zone: {
          $concat: ["$motherName.zone"]
        },
        createdAt: 1,
        addedByName: {
          $cond: {
            if: { $eq: [{ $type: "$addedBy" }, "object"] }, // Check if addedBy exists and is an object
            then: {
              $concat: ["$addedBy.FirstName", " ", "$addedBy.LastName"], // Concatenate first name and last name
            },
            else: "Unknown", // If addedBy is missing or invalid, show 'Unknown'
          },
        },
        fullName: {
          $concat: ["$firstName", " ", "$middleName", " ", "$lastName"], // Concatenate full name
        },
        fullAddress: {
          $concat: ["$zone", ", ", "$address"], // Concatenate zone and address
        },
      },
    },
    {
      $group: {
        _id: null,
        totalMale: {
          $sum: { $cond: [{ $eq: ["$gender", "Male"] }, 1, 0] },
        },
        totalFemale: {
          $sum: { $cond: [{ $eq: ["$gender", "Female"] }, 1, 0] },
        },
        totalRecords: { $sum: 1 },
        data: { $push: "$$ROOT" }, // Include the full list of babies
      },
    },
  ]);

  // If no data found, return 0 for male and female counts
  const resultData = result.length > 0 ? result[0] : { totalMale: 0, totalFemale: 0, totalRecords: 0, data: [] };

  res.status(200).json({
    status: "success",
    totalMale: resultData.totalMale,
    totalFemale: resultData.totalFemale,
    totalRecords: resultData.totalRecords,
    data: resultData.data,
  });
});


exports.deletedSpecificData = AsyncErrorHandler(async (req, res, next) => {
  const ipAddress = getClientIp(req); // Get client IP
  const userId = req.user._id;        // Authenticated user

  // Find the record before deleting to get details for logging
  const deletedData = await NewBaby.findById(req.params.id);

  if (!deletedData) {
    return res.status(404).json({
      status: "fail",
      message: "Newborn record not found.",
    });
  }

  // Proceed with deletion
  await NewBaby.findByIdAndDelete(req.params.id);

  // Create Audit Log entry
  const auditLog = new AuditLog({
    userId,
    action: "Delete Newborn Record",
    module: "newborn",
    targetId: deletedData._id,
    description: `Deleted newborn record for ${deletedData.firstName} ${deletedData.lastName}`,
    details: {
      fullName: `${deletedData.firstName} ${deletedData.middleName || ""} ${deletedData.lastName}`,
      gender: deletedData.gender,
      dateOfBirth: deletedData.dateOfBirth,
      birthWeight: deletedData.birthWeight,
      birthHeight: deletedData.birthHeight,
    },
    ipAddress,
  });

  await auditLog.save();

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.UpdateBabyData = AsyncErrorHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    birthWeight,
    motherName,
  } = req.body;
  const missingFields = [];

  if (!firstName) missingFields.push("First Name");
  if (!lastName) missingFields.push("Last Name");
  if (!birthWeight) missingFields.push("Birth Weight");
  if (!dateOfBirth) missingFields.push("Date Of Birth");
  if (!gender) missingFields.push("Gender");

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "fail",
      message: "Missing required fields",
      missingFields,
    });
  }

  const ipAddress = getClientIp(req); // Utility function
  const userId = req.user._id;

  // 🔎 Fetch existing data before update for audit comparison
  const existingData = await NewBaby.findById(req.params.id);
  if (!existingData) {
    return res.status(404).json({
      status: "fail",
      message: "Baby data not found",
    });
  }

  // ✏️ Perform the update
  const updateBaby = await NewBaby.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // 🔍 Re-aggregate updated data
  const toolWithCategory = await NewBaby.aggregate([
    { $match: { _id: updateBaby._id } },
    {
      $lookup: {
        from: "users",
        localField: "addedBy",
        foreignField: "_id",
        as: "addedBy",
      },
    },
    { $unwind: { path: "$addedBy", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "motherName",
        foreignField: "_id",
        as: "motherName",
      },
    },
    { $unwind: "$motherName" },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        middleName: 1,
        dateOfBirth: {
          $dateToString: {
            format: "%b %d %Y",
            date: "$dateOfBirth",
          },
        },
        gender: 1,
        birthWeight: 1,
        motherName: {
          $concat: ["$motherName.FirstName", " ", "$motherName.LastName"],
        },
        address: 1,
        zone: 1,
        createdAt: 1,
        addedByName: {
          $cond: {
            if: { $eq: [{ $ifNull: ["$addedBy", null] }, null] },
            then: "N/A",
            else: { $concat: ["$addedBy.FirstName", " ", "$addedBy.LastName"] },
          },
        },
        fullName: {
          $concat: ["$firstName", " ", "$middleName", " ", "$lastName"],
        },
        fullAddress: {
          $concat: ["$zone", ", ", "$address"],
        },
      },
    },
  ]);

  if (!toolWithCategory.length) {
    return res.status(404).json({
      status: "fail",
      message: "No baby data found with related user information",
    });
  }

  // 📝 Save audit log
  const auditLog = new AuditLog({
    userId,
    action: "Update Newborn Record",
    module: "newborn",
    targetId: updateBaby._id,
    description: `Updated newborn record for ${updateBaby.firstName} ${updateBaby.lastName}`,
    details: {
      before: {
        firstName: existingData.firstName,
        lastName: existingData.lastName,
        birthWeight: existingData.birthWeight,
        birthHeight: existingData.birthHeight,
        gender: existingData.gender,
        dateOfBirth: existingData.dateOfBirth,
      },
      after: {
        firstName: updateBaby.firstName,
        lastName: updateBaby.lastName,
        birthWeight: updateBaby.birthWeight,
        birthHeight: updateBaby.birthHeight,
        gender: updateBaby.gender,
        dateOfBirth: updateBaby.dateOfBirth,
      },
    },
    ipAddress,
  });

  await auditLog.save();

  res.status(200).json({
    status: "success",
    data: toolWithCategory[0],
  });
});

exports.DisplayGraph = AsyncErrorHandler(async(req,res,next)=>{

   const features = new Apifeatures(NewBaby.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Get IDs after filtering and pagination
  const filteredBabies = await features.query;
  const ids = filteredBabies.map((baby) => baby._id);

  // Perform aggregation with $lookup, $project, and gender counting
  const result = await NewBaby.aggregate([
    {
      $match: { _id: { $in: ids } }, // Match babies by the filtered IDs
    },
    {
      $lookup: {
        from: "users", // Join with 'users' collection
        localField: "addedBy", // Reference to the 'addedBy' field in NewBaby schema
        foreignField: "_id", // Match with '_id' in 'users'
        as: "addedBy", // Output the matched user data into the 'addedBy' field
      },
    },
    {
      $unwind: {
        path: "$addedBy", // Unwind the 'addedBy' array to access user details
        preserveNullAndEmptyArrays: true, // Preserve documents even if 'addedBy' is missing
      },
    },
    {
      $lookup: {
        from: "users", // Join with 'users' collection for motherName
        localField: "motherName", // Reference to the 'motherName' field in NewBaby schema
        foreignField: "_id", // Match with '_id' in 'users'
        as: "motherName",
      },
    },
    { $unwind: "$motherName" },
    {
      $project: {
        firstName: 1,
        middleName: 1,
        lastName: 1,
        dateOfBirth: {
          $dateToString: {
            format: "%b %d %Y", // Format date as 'Jan 13 2025'
            date: "$dateOfBirth",
          },
        },
        gender: 1, // Include gender for filtering
        birthWeight: 1,
        birthHeight: 1,
        motherName: {
          $concat: ["$motherName.FirstName", " ", "$motherName.LastName"],
        },
        motherID: "$motherName._id",
        address: {
          $concat: ["$motherName.zone", " ", "$motherName.address"],
        },
        phoneNumber: {
          $concat: ["$motherName.phoneNumber"],
        },
        zone: {
          $concat: ["$motherName.zone"],
        },
        createdAt: 1,
        addedByName: {
          $cond: {
            if: { $eq: [{ $type: "$addedBy" }, "object"] }, // Check if addedBy exists and is an object
            then: {
              $concat: ["$addedBy.FirstName", " ", "$addedBy.LastName"], // Concatenate first name and last name
            },
            else: "Unknown", // If addedBy is missing or invalid, show 'Unknown'
          },
        },
        fullName: {
          $concat: ["$firstName", " ", "$middleName", " ", "$lastName"], // Concatenate full name
        },
        fullAddress: {
          $concat: ["$zone", ", ", "$address"], // Concatenate zone and address
        },
      },
    },
    {
      $sort: { birthWeight: -1 }, // Sort by birth weight in descending order
    },
    {
      $group: {
        _id: null,
        totalMale: {
          $sum: { $cond: [{ $eq: ["$gender", "Male"] }, 1, 0] },
        },
        totalFemale: {
          $sum: { $cond: [{ $eq: ["$gender", "Female"] }, 1, 0] },
        },
        totalRecords: { $sum: 1 },
        topBabies: { $push: "$$ROOT" }, // Push top babies data into topBabies field
      },
    },
    { $limit: 10 }, // Limit the output to top 10 babies by weight
    {
      $project: {
        topBabies: 1, // Keep only the top babies in the final result
        totalMale: 1,
        totalFemale: 1,
        totalRecords: 1,
      },
    },
  ]);

  // If no data found, return 0 for male and female counts
  const resultData = result.length > 0 ? result[0] : { totalMale: 0, totalFemale: 0, totalRecords: 0, topBabies: [] };

  // Prepare formatted result
  const topBabiesFormatted = resultData.topBabies.map((baby, index) => ({
    number: index + 1,
    name: baby.fullName,
    totalWeight: `${baby.birthWeight} kg`,
    birthMonth: baby.dateOfBirth.split(" ")[0], // Extract the month from the formatted date
    zone: baby.zone || "Unknown", 
  }));

  res.status(200).json({
    status: "success",
    totalMale: resultData.totalMale,
    totalFemale: resultData.totalFemale,
    totalRecords: resultData.totalRecords,
    topBabies: topBabiesFormatted,
  });

})

