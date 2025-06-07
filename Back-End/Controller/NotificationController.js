const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const Notification = require('./../Models/NotificationSchema');
const Apifeatures = require('./../Utils/ApiFeatures');


exports.createNotification=AsyncErrorHandler(async(req,res) => {
    const notify = await Notification.create(req.body);
    res.status(201).json({
        status:'success',
        data:
            notify
    })

})

exports.DisplayNotification = AsyncErrorHandler(async (req, res) => {
    // Initialize query with features
    const features = new Apifeatures(Notification.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    // Execute the base query
    const notifications = await features.query;

    // Aggregate to get enriched notification data
    const records = await Notification.aggregate([
        // Match stage to filter notifications first
        { $match: { _id: { $in: notifications.map(n => n._id) } }},

        // Lookup newborn information
        {
            $lookup: {
                from: "newborns",
                localField: "newborn",
                foreignField: "_id",
                as: "newborn",
            },
        },
        { $unwind: "$newborn" },

        // Lookup mother information
        {
            $lookup: {
                from: "users",
                localField: "newborn.motherName",
                foreignField: "_id",
                as: "mother",
            },
        },
        { $unwind: "$mother" },

        // ✅ Sort by createdAt (latest first)
        { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json({
        status: 'success',
        results: records.length,
        data: records
    });
});



