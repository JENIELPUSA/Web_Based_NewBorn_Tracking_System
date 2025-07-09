const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const CheckupRecord = require("../Models/CheckupRecords");
const CustomError = require("../Utils/CustomError");
const mongoose = require("mongoose");
exports.createCheckup = AsyncErrorHandler(async (req, res) => {
  const {
    newborn,
    weight,
    height,
    health_condition,
    notes,
    visitDate,
    addedBy, // get this from req.body
  } = req.body;

  const missingFields = [];
  if (!newborn) missingFields.push("Newborn");
  if (!weight) missingFields.push("Weight");
  if (!height) missingFields.push("Height");
  if (!health_condition) missingFields.push("Health Condition");
  if (!addedBy) missingFields.push("Added By"); // ✅ validation for addedBy

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  const newRecord = await CheckupRecord.create({
    newborn,
    weight,
    height,
    health_condition,
    notes,
    visitDate: visitDate || new Date(),
    addedBy, // use value from body
  });

  const populatedData = await CheckupRecord.aggregate([
    { $match: { _id: newRecord._id } },
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
        from: "users",
        localField: "addedBy",
        foreignField: "_id",
        as: "addedBy",
      },
    },
    { $unwind: { path: "$addedBy", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        weight: 1,
        height: 1,
        health_condition: 1,
        notes: 1,
        visitDate: 1,
        createdAt: 1,

        newbornId: "$newborn._id",
        newbornName: {
          $concat: [
            { $ifNull: ["$newborn.firstName", ""] },
            " ",
            { $ifNull: ["$newborn.lastName", ""] },
          ],
        },
        dateOfBirth: "$newborn.dateOfBirth",
        gender: "$newborn.gender",

        addedByName: {
          $concat: [
            { $ifNull: ["$addedBy.FirstName", ""] },
            " ",
            { $ifNull: ["$addedBy.LastName", ""] },
          ],
        },
        addedByRole: "$addedBy.role",
      },
    },
  ]);

  res.status(201).json({
    status: "success",
    data: populatedData[0],
  });
});

exports.updateCheckup = AsyncErrorHandler(async (req, res) => {
  const { id } = req.params;

  const {
    newborn,
    weight,
    height,
    health_condition,
    notes,
    visitDate,
    addedBy,
  } = req.body;

  const updatedRecord = await CheckupRecord.findByIdAndUpdate(
    id,
    {
      ...(newborn && { newborn }),
      ...(weight && { weight }),
      ...(height && { height }),
      ...(health_condition && { health_condition }),
      ...(notes && { notes }),
      ...(visitDate && { visitDate }),
      ...(addedBy && { addedBy }),
    },
    { new: true }
  );

  if (!updatedRecord) {
    return res.status(404).json({
      status: "fail",
      message: "Checkup record not found.",
    });
  }

  const populatedData = await CheckupRecord.aggregate([
    { $match: { _id: updatedRecord._id } },
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
        from: "users",
        localField: "addedBy",
        foreignField: "_id",
        as: "addedBy",
      },
    },
    { $unwind: { path: "$addedBy", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        weight: 1,
        height: 1,
        health_condition: 1,
        notes: 1,
        visitDate: 1,
        createdAt: 1,

        newbornId: "$newborn._id",
        newbornName: {
          $concat: [
            { $ifNull: ["$newborn.firstName", ""] },
            " ",
            { $ifNull: ["$newborn.lastName", ""] },
          ],
        },
        dateOfBirth: "$newborn.dateOfBirth",
        gender: "$newborn.gender",

        addedByName: {
          $concat: [
            { $ifNull: ["$addedBy.FirstName", ""] },
            " ",
            { $ifNull: ["$addedBy.LastName", ""] },
          ],
        },
        addedByRole: "$addedBy.role",
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: populatedData[0],
  });
});


exports.displayLatestCheckup = AsyncErrorHandler(async (req, res) => {
  const { newbornId } = req.params;

  if (!newbornId) {
    return res.status(400).json({ message: "Missing Newborn ID." });
  }

  const objectId = new mongoose.Types.ObjectId(newbornId);

  // First, find the newborn directly (in case no checkups exist)
  const newborn = await mongoose.model("Newborn").findById(objectId).lean();
  if (!newborn) {
    return res.status(404).json({ message: "Newborn not found." });
  }

  const checkupRecords = await CheckupRecord.aggregate([
    { $match: { newborn: objectId } },
    { $sort: { visitDate: -1, createdAt: -1 } },
    { $limit: 2 },

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
        from: "users",
        localField: "addedBy",
        foreignField: "_id",
        as: "addedBy",
      },
    },
    { $unwind: { path: "$addedBy", preserveNullAndEmptyArrays: true } },

    {
      $project: {
        _id: 1,
        weight: 1,
        height: 1,
        health_condition: 1,
        notes: 1,
        visitDate: 1,
        createdAt: 1,

        newbornId: "$newborn._id",
        newbornName: {
          $concat: [
            { $ifNull: ["$newborn.firstName", ""] },
            " ",
            { $ifNull: ["$newborn.lastName", ""] },
          ],
        },
        birthWeight: "$newborn.birthWeight",
        birthHeight: "$newborn.birthHeight",
        dateOfBirth: "$newborn.dateOfBirth",
        gender: "$newborn.gender",

        addedByName: {
          $concat: [
            { $ifNull: ["$addedBy.FirstName", ""] },
            " ",
            { $ifNull: ["$addedBy.LastName", ""] },
          ],
        },
        addedByRole: "$addedBy.role",
      },
    },
  ]);

  // If NO checkups: return newborn height/weight only
  if (!checkupRecords || checkupRecords.length === 0) {
    return res.status(200).json({
      status: "success",
      data: {
        currentHeight: newborn.birthHeight ?? 0,
        currentWeight: newborn.birthWeight ?? 0,
        previousHeight: null,
        previousWeight: null,
        heightDiff: null,
        weightDiff: null,
        newbornId: newborn._id,
        newbornName: `${newborn.firstName} ${newborn.lastName}`,
        dateOfBirth: newborn.dateOfBirth,
        gender: newborn.gender,
        isFromNewbornOnly: true,
      },
    });
  }

  // If checkups exist: apply fallback logic
  const latest = checkupRecords[0];
  const previous = checkupRecords[1] || null;

  const currentHeight =
    latest?.height != null
      ? latest.height
      : previous?.height != null
      ? previous.height
      : latest?.birthHeight ?? 0;

  const currentWeight =
    latest?.weight != null
      ? latest.weight
      : previous?.weight != null
      ? previous.weight
      : latest?.birthWeight ?? 0;

  const previousHeight = previous?.height ?? null;
  const previousWeight = previous?.weight ?? null;

  const heightDiff =
    previousHeight != null ? currentHeight - previousHeight : null;

  const weightDiff =
    previousWeight != null ? currentWeight - previousWeight : null;

  res.status(200).json({
    status: "success",
    data: {
      ...latest,
      currentHeight,
      currentWeight,
      previousHeight,
      previousWeight,
      heightDiff,
      weightDiff,
      isFromNewbornOnly: false,
    },
  });
});

exports.displayAllCheckups = AsyncErrorHandler(async (req, res) => {
  const { newbornId } = req.params;

  if (!newbornId) {
    return res.status(400).json({ message: "Missing Newborn ID." });
  }

  const records = await CheckupRecord.aggregate([
    {
      $match: {
        newborn: new mongoose.Types.ObjectId(newbornId),
      },
    },
    {
      $sort: {
        visitDate: -1,
        createdAt: -1,
      },
    },
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
        from: "users",
        localField: "addedBy",
        foreignField: "_id",
        as: "addedBy",
      },
    },
    { $unwind: { path: "$addedBy", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        weight: 1,
        height: 1,
        health_condition: 1,
        notes: 1,
        visitDate: 1,
        createdAt: 1,

        newbornId: "$newborn._id",
        newbornName: {
          $concat: [
            { $ifNull: ["$newborn.firstName", ""] },
            " ",
            { $ifNull: ["$newborn.lastName", ""] },
          ],
        },
        dateOfBirth: "$newborn.dateOfBirth",
        gender: "$newborn.gender",

        addedByName: {
          $concat: [
            { $ifNull: ["$addedBy.FirstName", ""] },
            " ",
            { $ifNull: ["$addedBy.LastName", ""] },
          ],
        },
        addedByRole: "$addedBy.role",
      },
    },
  ]);

  if (!records || records.length === 0) {
    return res.status(404).json({ message: "No checkup record found." });
  }

  res.status(200).json({
    status: "success",
    data: records,
  });
});


exports.deleteCheckup = AsyncErrorHandler(async (req, res, next) => {
  await CheckupRecord.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    data: null,
  });
});



