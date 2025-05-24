const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const Vaccine = require("../Models/VaccineModel");
const CustomError = require("./../Utils/CustomError");
const Apifeatures = require("./../Utils/ApiFeatures");
const mongoose = require("mongoose");

exports.createNewRecord = AsyncErrorHandler(async (req, res) => {
  const { name, description, stock, expirationDate, zone, dosage, brand } =
    req.body;

  const missingFields = [];

  if (!name) missingFields.push("Name");
  if (!description) missingFields.push("Description");
  if (stock == null) missingFields.push("Stock");
  if (!expirationDate) missingFields.push("Expiration Date");
  if (!zone) missingFields.push("Zone");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `The following fields are required: ${missingFields.join(", ")}`,
    });
  }

  // Find or create vaccine
  let vaccine = await Vaccine.findOne({ name, brand, dosage, zone });

  if (!vaccine) {
    // Create a new vaccine if not found
    vaccine = await Vaccine.create({
      name,
      brand,
      dosage,
      description,
      zone,
      batches: [{ stock, expirationDate }],
    });
  } else {
    // Make sure batches is always an array
    if (!Array.isArray(vaccine.batches)) {
      vaccine.batches = [];
    }
    vaccine.batches.push({ stock, expirationDate });
    await vaccine.save();
  }

  // Use aggregation to return populated brand
  const displayVaccine = await Vaccine.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(vaccine._id) } },
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    {
      $unwind: {
        path: "$brand",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        dosage: 1,
        zone: 1,
        "brand._id": 1,
        "brand.name": 1,
        batches: 1,
        createdAt: 1,
      },
    },
  ]);

  // Check if displayVaccine has data
  if (!displayVaccine.length) {
    return res.status(404).json({
      status: "error",
      message: "Vaccine not found after creation or update.",
    });
  }

  res.status(201).json({
    status: "success",
    data: displayVaccine[0],
    message: "Vaccine batch added successfully",
  });
});

exports.DisplayAllData = AsyncErrorHandler(async (req, res) => {
  const matchStage = {}; // Extend with filters if needed

  // 1. Fetch all vaccines with brand populated
  const displayVacine = await Vaccine.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    {
      $unwind: {
        path: "$brand",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        dosage: 1,
        zone: 1,
        "brand._id": 1,
        "brand.name": 1,
        batches: 1,
        createdAt: 1,
      },
    },
  ]);

  // 2. Count expired vs not expired from Vaccine.batches
  const today = new Date();
  let expired = 0;
  let notExpired = 0;

  displayVacine.forEach(vaccine => {
    vaccine.batches?.forEach(batch => {
      if (batch.expirationDate) {
        const expDate = new Date(batch.expirationDate);
        if (expDate < today) {
          expired++;
        } else {
          notExpired++;
        }
      }
    });
  });

  // 3. Final response
  res.status(200).json({
    status: "success",
    data: displayVacine,
    totalVaccine: displayVacine.length,
    totals: {
      expired,
      notExpired,
    },
  });
});



exports.UpdateVaccine = AsyncErrorHandler(async (req, res, next) => {
  const {
    vaccineId,
    batchId,
    name,
    description,
    dosage,
    brand,
    stock,
    expirationDate,
    zone,
  } = req.body;

  // Step 1: Find the vaccine by ID
  const vaccine = await Vaccine.findById(vaccineId);
  if (!vaccine) {
    return res
      .status(404)
      .json({ status: "fail", message: "Vaccine not found" });
  }

  // Step 2: Update vaccine fields
  if (name) vaccine.name = name;
  if (description) vaccine.description = description;
  if (dosage) vaccine.dosage = dosage;
  if (brand) vaccine.brand = brand;
  if (zone) vaccine.zone = zone;

  // Step 3: Find and update the batch by batchId
  const batchIndex = vaccine.batches.findIndex(
    (batch) => batch._id.toString() === batchId
  );
  if (batchIndex !== -1) {
    if (stock !== undefined) vaccine.batches[batchIndex].stock = stock;
    if (expirationDate)
      vaccine.batches[batchIndex].expirationDate = expirationDate;
  } else {
    return res.status(404).json({ status: "fail", message: "Batch not found" });
  }

  // Step 4: Save updated document
  await vaccine.save();

  // Step 5: Return updated vaccine using aggregation with populated brand
  const updatedVaccine = await Vaccine.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(vaccineId) } },
    {
      $lookup: {
        from: "brands",
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: 1,
        description: 1,
        dosage: 1,
        zone: 1,
        "brand._id": 1,
        "brand.name": 1,
        batches: 1,
        createdAt: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: updatedVaccine[0],
  });
});

exports.deleteVaccine = AsyncErrorHandler(async (req, res, next) => {
  const { id } = req.params; // Vaccine ID
  const { batchId } = req.body; // Batch ID (required)

  if (!batchId) {
    return res.status(400).json({
      status: "fail",
      message: "batchId is required to delete a batch",
    });
  }

  // Remove the specific batch from the batches array
  const updatedVaccine = await Vaccine.findByIdAndUpdate(
    id,
    { $pull: { batches: { _id: batchId } } },
    { new: true }
  );

  if (!updatedVaccine) {
    return res.status(404).json({
      status: "fail",
      message: "Vaccine not found",
    });
  }

  return res.status(200).json({
    status: "success",
    data: updatedVaccine,
    message: "Batch deleted successfully",
  });
});

