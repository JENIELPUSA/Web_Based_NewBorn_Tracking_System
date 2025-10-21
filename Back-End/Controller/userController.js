const mongoose = require("mongoose");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const CustomError = require("../Utils/CustomError");
const user = require("../Models/usermodel");
const Apifeatures = require("./../Utils/ApiFeatures");
const LogAudit = require("./../Models/LogAndAudit");
const newBorn = require("./../Models/NewBornmodel");
const Checkup = require("./../Models/CheckupRecords");
const Notify = require("./../Models/NotificationSchema");
const VaccinationRecrd = require("./../Models/VaccinationRecord");
const cloudinary = require("../Utils/cloudinary");

exports.createUser = AsyncErrorHandler(async (req, res) => {
  const { FirstName, LastName, email, password, role } = req.body;
  // Laging required ang FirstName at LastName
  if (!FirstName || !LastName) {
    return res.status(400).json({
      status: "fail",
      message: "First Name and Last Name are required.",
    });
  }

  // Kapag hindi Guest, kailangan ng email at password
  if (role !== "Guest") {
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email and password are required for non-Guest roles.",
      });
    }

    // Optional: validate email format
    const isValidEmail = /\S+@\S+\.\S+/.test(email);
    if (!isValidEmail) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide a valid email address.",
      });
    }
  }

  // Create user
  const newUser = await user.create(req.body);
  console.log("User created:", newUser);

  res.status(201).json({
    status: "success",
    data: newUser,
  });
});

exports.DisplayAll = AsyncErrorHandler(async (req, res) => {
  const features = new Apifeatures(user.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  let displayuser = await features.query;

  if (!displayuser) {
    return res.status(404).json({ message: "No users found" });
  }

  // Perform aggregation to count male and female users
  const result = await user.aggregate([
    {
      $match: {}, // Match all users (after the query filters are applied)
    },
    {
      $group: {
        _id: null, // No grouping by any field
        totalMale: {
          $sum: { $cond: [{ $eq: ["$gender", "Male"] }, 1, 0] },
        },
        totalFemale: {
          $sum: { $cond: [{ $eq: ["$gender", "Female"] }, 1, 0] },
        },
      },
    },
  ]);

  // Get the count of male and female users
  const totalMale = result.length > 0 ? result[0].totalMale : 0;
  const totalFemale = result.length > 0 ? result[0].totalFemale : 0;

  res.status(200).json({
    status: "success",
    totalUser: displayuser.length,
    totalMale: totalMale,
    totalFemale: totalFemale,
    data: displayuser,
  });
});

exports.deleteUser = AsyncErrorHandler(async (req, res) => {
  const [hasLogsAudit, hasNewBorn, hasCheckup, hasNotify, hasRecord] =
    await Promise.all([
      LogAudit.exists({ userId: req.params.id }),
      newBorn.exists({ addedBy: req.params.id }),
      Checkup.exists({ addedBy: req.params.id }),
      Notify.exists({ readBy: req.params.id }),
      VaccinationRecrd.exists({ administeredBy: req.params.id }),
    ]);

  if (hasLogsAudit || hasNewBorn || hasCheckup || hasNotify || hasRecord) {
    return res.status(400).json({
      status: "fail",
      message: "Cannot delete User: there are existing related records.",
    });
  }

  await user.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.Updateuser = AsyncErrorHandler(async (req, res, next) => {
  const { FirstName, LastName, email } = req.body;

  if (!FirstName || !LastName || !email) {
    return res.status(400).json({
      status: "fail",
      message: "Please fill in all required fields.",
    });
  }

  const updateuser = await user.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({
    status: "success",
    data: updateuser,
  });
});

exports.Getiduser = AsyncErrorHandler(async (req, res, next) => {
  const users = await user.findById(req.params.id);
  if (!users) {
    const error = new CustomError("User with the ID is not found", 404);
    return next(error);
  }
  res.status(200).json({
    status: "Success",
    data: users,
  });
});

exports.updatePassword = AsyncErrorHandler(async (req, res, next) => {
  const user = await user.findById(req.user._id).select("+password");
  if (
    !(await user.comparePasswordInDb(req.body.currentPassword, user.password))
  ) {
    return next(
      new CustomError("The current password you provided is wrong", 401)
    );
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  //LOGIN USER & SEND JWT
  authController.createSendResponse(user, 200, res);
});

exports.signup = AsyncErrorHandler(async (req, res, next) => {
  const { FirstName, Middle, LastName, email, password, role } = req.body;
  user
    .findOne({ email: email })
    .then((user) => {
      if (user) {
        res.json("Already Have an Account!");
      } else {
        user
          .create({
            FirstName: FirstName,
            Middle: Middle,
            LastName: LastName,
            email: email,
            password: password,
            role: role,
          })
          .then((result) => res.json(result))

          .catch((err) => res.json(err));
      }
    })
    .catch((err) => res.json(err));
});

exports.DisplayProfile = AsyncErrorHandler(async (req, res) => {
  const userId = req.params.id;

  let displayuser;

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    const foundUser = await user.findById(userId);
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }
    displayuser = [foundUser];
  } else {
    const features = new Apifeatures(user.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    displayuser = await features.query;
  }

  const result = await user.aggregate([
    { $match: userId ? { _id: new mongoose.Types.ObjectId(userId) } : {} },
    {
      $group: {
        _id: null,
        totalMale: {
          $sum: { $cond: [{ $eq: ["$gender", "Male"] }, 1, 0] },
        },
        totalFemale: {
          $sum: { $cond: [{ $eq: ["$gender", "Female"] }, 1, 0] },
        },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: displayuser,
    stats: result[0] || {},
  });
});


exports.updateUserProfile = AsyncErrorHandler(async (req, res) => {

  console.log(req.body)
  const { id } = req.params;

  if (!req.file) {
    return res
      .status(400)
      .json({ status: "error", message: "No file uploaded" });
  }

  try {
    const existingUser = await user.findById(id);
    if (!existingUser) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    if (existingUser.avatar?.public_id) {
      await cloudinary.uploader.destroy(existingUser.avatar.public_id);
    }

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const uploadedResponse = await cloudinary.uploader.upload(base64Image, {
      folder: "NewBornTracking/UserAvatars", 
      use_filename: true,
      unique_filename: false,
    });

    // I-prepare ang bagong avatar object
    const avatar = {
      public_id: uploadedResponse.public_id,
      url: uploadedResponse.secure_url,
    };

    // I-update ang user
    const updatedUser = await user.findByIdAndUpdate(
      id,
      { avatar },
      { new: true }
    );

    res.status(200).json({ status: "success", data: updatedUser });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ status: "error", message: "Upload failed" });
  }
});
