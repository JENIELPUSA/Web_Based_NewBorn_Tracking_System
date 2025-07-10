const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const Notification = require('./../Models/NotificationSchema');
const Apifeatures = require('./../Utils/ApiFeatures');
const mongoose = require("mongoose");

exports.createNotification=AsyncErrorHandler(async(req,res) => {
    const notify = await Notification.create(req.body);
    res.status(201).json({
        status:'success',
        data:
            notify
    })

})

exports.DisplayNotification = AsyncErrorHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const records = await Notification.aggregate([
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
        from: "users",
        localField: "newborn.motherName",
        foreignField: "_id",
        as: "mother",
      },
    },
    { $unwind: { path: "$mother", preserveNullAndEmptyArrays: true } },

    { $sort: { createdAt: -1 } },

    { $skip: skip },
    { $limit: limit },
  ]);

  const total = await Notification.countDocuments();

  res.status(200).json({
    status: "success",
    results: records.length,
    total,
    page,
    limit,
    data: records,
  });
});




