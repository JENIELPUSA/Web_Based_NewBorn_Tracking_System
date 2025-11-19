const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const parent = require("./../Models/ParentSchema");
const Apifeatures = require("./../Utils/ApiFeatures");
const Newborn = require("./../Models/NewBornmodel");

exports.createParent = async (req, res) => {
  try {
    const parents = await parent.create(req.body);

    res.status(201).json({
      status: "success",
      data: parents,
    });
  } catch (error) {
    console.error("Error creating parent:", error);

    res.status(500).json({
      status: "error",
      message: "Failed to create parent",
      error: error.message,
    });
  }
};


exports.DisplayParent = AsyncErrorHandler(async (req, res) => {
  const features = new Apifeatures(parent.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const branded = await features.query;

  res.status(200).json({
    status: "success",
    data: branded,
  });
});

exports.UpdateParent = AsyncErrorHandler(async (req, res, next) => {
  const updatebrand = await parent.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json({
    status: "success",
    data: updatebrand,
  });
});

exports.deleteParent = AsyncErrorHandler(async (req, res, next) => {
  const hasNewborn = await Newborn.exists({ motherName: req.params.id });

  if (hasNewborn) {
    return res.status(400).json({
      status: "fail",
      message: "Cannot delete Parent: there are existing related records.",
    });
  }

  await parent.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    data: null,
  });
});
