const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const NewBaby = require("../Models/NewBornmodel");
const CustomError = require("./../Utils/CustomError");
const Apifeatures = require("./../Utils/ApiFeatures");
const mongoose = require("mongoose");

exports.createNewRecord = AsyncErrorHandler(async (req, res) => {
  const { firstName, lastName, dateOfBirth, gender, birthWeight, motherName,birthHeight } =
    req.body;
  // Create an array to collect missing fields
  const missingFields = [];

  // Check if any required fields are missing
  if (!firstName) missingFields.push("First Name");
  if (!lastName) missingFields.push("Last Name");
  if (!birthWeight) missingFields.push("Birth Weight");
  if (!motherName) missingFields.push("Mother Name");
  if (!dateOfBirth) missingFields.push("Date Of Birth");
  if (!gender) missingFields.push("Gender");
    if (!birthHeight) missingFields.push("Birth Height");

  // If there are any missing fields, return them in the response
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `The following fields are required: ${missingFields.join(", ")}`,
    });
  }
  // Create the new newborn record
  const newData = await NewBaby.create(req.body);

  // If creation failed
  if (!newData) {
    return res.status(400).json({
      status: "fail",
      message: "Newborn creation failed.",
    });
  }

  // Lookup and project addedBy with full name
  const toolWithCategory = await NewBaby.aggregate([
    {
      $match: { _id: newData._id },
    },
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
          $dateToString: {
            format: "%b %d %Y", // Jan 13 2025
            date: "$dateOfBirth",
          },
        },
        gender: 1,
        birthWeight: 1,
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

  res.status(201).json({
    status: "success",
    //ang purpose ng [0] n yan is from arry to object result
    data: toolWithCategory[0],
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

  // Perform aggregation with $lookup and $project for full name
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
        gender: 1,
        birthWeight: 1,
        birthHeight:1,
        motherName: {
          $concat: ["$motherName.FirstName", " ", "$motherName.LastName"],
        },
        address: {
          $concat: ["$motherName.zone", " ", "$motherName.address"],
        },
            phoneNumber: {
          $concat: ["$motherName.phoneNumber"],
        },
        zone: 1,
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
  ]);

  res.status(200).json({
    status: "success",
    totalRecords: result.length,
    data: result,
  });
});

exports.deletedSpecificData = AsyncErrorHandler(async (req, res, next) => {
  await NewBaby.findByIdAndDelete(req.params.id);

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

  // Check if any required fields are missing
  if (!firstName) missingFields.push("First Name");
  if (!lastName) missingFields.push("Last Name");
  if (!birthWeight) missingFields.push("Birth Weight");
  if (!motherName) missingFields.push("Mother Name");
  if (!dateOfBirth) missingFields.push("Date Of Birth");
  if (!gender) missingFields.push("Gender");


  // ❗ ADD THIS CHECK:
  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "fail",
      message: "Missing required fields",
      missingFields,
    });
  }

  // Update the baby data
  const updateBaby = await NewBaby.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updateBaby) {
    return res.status(404).json({
      status: "fail",
      message: "Baby data not found",
    });
  }

  // Aggregate the baby data with the related user (addedBy) information
  const toolWithCategory = await NewBaby.aggregate([
    {
      $match: { _id: updateBaby._id }, // Use the updated baby's _id
    },
    {
      $lookup: {
        from: "users",
        localField: "addedBy",
        foreignField: "_id",
        as: "addedBy",
      },
    },
    { $unwind: { path: "$addedBy", preserveNullAndEmptyArrays: true } }, // Ensure that even if addedBy is missing, no error occurs
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
            format: "%b %d %Y", // Jan 13 2025
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
            if: { $eq: [{ $ifNull: ["$addedBy", null] }, null] }, // Check if addedBy is null
            then: "N/A", // Fallback if addedBy is missing
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

  res.status(200).json({
    status: "success",
    data: toolWithCategory[0], // Assuming you only expect one result from aggregation
  });
});
