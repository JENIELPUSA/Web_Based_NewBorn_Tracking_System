const AuditLog = require("../Models/LogAndAudit");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");

// GET all audit logs with dynamic targetInfo lookup
exports.getAllAuditLogs = AsyncErrorHandler(async (req, res) => {
  const { module, action, from, to } = req.query;

  const filter = {};
  if (module) filter.module = module;
  if (action) filter.action = action;
  if (from && to) {
    filter.timestamp = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  const logs = await AuditLog.aggregate([
    { $match: filter },

    // Lookup user info
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },

    // Lookup vaccine info (if target is vaccine)
    {
      $lookup: {
        from: "vaccines",
        localField: "targetId",
        foreignField: "_id",
        as: "vaccineInfo",
      },
    },

    // Lookup newborn info (if target is newborn)
    {
      $lookup: {
        from: "newborns",
        localField: "targetId",
        foreignField: "_id",
        as: "newbornInfo",
      },
    },

    // Lookup assigned vaccine info (if target is assigned vaccine)
    {
      $lookup: {
        from: "assignedvaccines",
        localField: "targetId",
        foreignField: "_id",
        as: "assignedVaccineInfo",
      },
    },

    // Determine which target to use dynamically
    {
      $addFields: {
        targetInfo: {
          $switch: {
            branches: [
              {
                case: { $eq: ["$module", "vaccine"] },
                then: { $arrayElemAt: ["$vaccineInfo", 0] },
              },
              {
                case: { $eq: ["$module", "newborn"] },
                then: { $arrayElemAt: ["$newbornInfo", 0] },
              },
              {
                case: { $eq: ["$module", "assignedVaccine"] },
                then: { $arrayElemAt: ["$assignedVaccineInfo", 0] },
              },
            ],
            default: null,
          },
        },
      },
    },

    // Format output
    {
      $project: {
        action: 1,
        module: 1,
        description: 1,
        timestamp: 1,
        ipAddress: 1,
        details: 1,
        user: {
          _id: "$userInfo._id",
          fullName: {
            $concat: ["$userInfo.FirstName", " ", "$userInfo.LastName"],
          },
          email: "$userInfo.email",
        },
        targetInfo: 1,
      },
    },

    { $sort: { timestamp: -1 } },
  ]);

  res.status(200).json({
    status: "success",
    data: logs,
  });
});

// CREATE a new general audit log
exports.createAuditLog = AsyncErrorHandler(async (req, res) => {
  const { userId, action, module, description, details, targetId, ipAddress } =
    req.body;

  // Validate required fields
  if (!userId || !action || !module) {
    return res
      .status(400)
      .json({ message: "User ID, action, and module are required" });
  }

  // Create a general audit log
  const newLog = new AuditLog({
    userId, // ID of the user performing the action
    action, // Action performed (e.g., DELETE, UPDATE, CREATE)
    module, // Module in which the action occurred (e.g., vaccine, newborn, user)
    targetId, // ID of the target entity (could be vaccineId, newbornId, etc.)
    description, // A human-readable description of the action
    details, // Optional field for detailed information (e.g., before/after states)
    ipAddress: ipAddress || req.ip, // IP address of the requestor (use req.ip if not provided)
  });

  // Save the new audit log
  await newLog.save();

  // Send a successful response
  res
    .status(201)
    .json({ message: "Audit log created successfully", log: newLog });
});
