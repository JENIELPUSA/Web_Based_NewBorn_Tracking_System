const User = require("../Models/usermodel");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const jwt = require("jsonwebtoken");
const CustomError = require("../Utils/CustomError");
const util = require("util");
const sendEmail = require("../Utils/email");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: "1d",
  });
};

const createSendResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  const options = {
    maxAge: process.env.LOGIN_EXPR,
    secure: true,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") options.secure = true;

  res.cookie("jwt", token, options);
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,

    data: {
      user,
    },
  });
};
exports.signup = AsyncErrorHandler(async (req, res, next) => {
  const {
    FirstName,
    LastName,
    email,
    extensionName,
    Middle,
    password,
    role,
    avatar,
    address,
    phoneNumber,
    dateOfBirth,
    gender,
    zone,
    Designatedzone,
  } = req.body;

  console.log("req.body", req.body);

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const missingFields = [];

  if (!FirstName) missingFields.push("First Name");
  if (!LastName) missingFields.push("Last Name");

  if (role !== "Guest") {
    if (!email) missingFields.push("Email");
    if (!password) missingFields.push("Password");
    if (!address) missingFields.push("Address");
    if (!dateOfBirth) missingFields.push("Date Of Birth");
    if (!gender) missingFields.push("Gender");
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `The following fields are required: ${missingFields.join(", ")}`,
    });
  }

  try {
    // Skip checking existing email if Guest (optional)
    if (role !== "Guest" && email) {
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User with this email already exists!" });
      }
    }

    const newUser = await User.create({
      FirstName,
      LastName,
      email,
      password,
      role,
      extensionName,
      Middle,
      avatar,
      address,
      phoneNumber,
      dateOfBirth,
      gender,
      zone,
      Designatedzone,
      otp,
      otpExpiresAt: Date.now() + 5 * 60 * 1000,
      isVerified: true,
    });

/*
// Send email only if not Guest
if (role !== "Guest" && email) {
  console.log("Email being passed to sendEmail:", email);
  await sendEmail({
    email: email,
    subject: "Temporary Password Generated",
    text: `Your temporary password is ${password}. Please change your password immediately.`,
  });
}
*/

    return res.send({
      status: "Success",
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred during signup." });
  }
});

exports.login = AsyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Step 1: Check if the user exists
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    console.log("User not found, throwing error");
    return next(new CustomError("Incorrect email or password", 400));
  }

  // Step 2: Check if password is correct
  const isPasswordCorrect = await user.comparePasswordInDb(
    password,
    user.password
  );
  if (!isPasswordCorrect) {
    console.log("Password mismatch, throwing error");
    return next(new CustomError("Incorrect email or password", 400));
  }

  // Step 3: Check if user is verified
  if (!user.isVerified) {
    console.log("User not verified, blocking login");
    return next(
      new CustomError(
        "Your account is not verified. Please check your email for the verification link or OTP.",
        403
      )
    );
  }

  // Step 4: Create JWT token
  const token = signToken(user._id);

  // Step 5: Set session and respond
  req.session.userId = user._id;
  req.session.isLoggedIn = true;
  req.session.user = {
    email: user.email,
    FirstName: user.FirstName,
    LastName: user.LastName,
    role: user.role,
    Designatedzone: user.Designatedzone,
  };

  const fullName = `${user.FirstName} ${user.LastName}`;

  return res.status(200).send({
    status: "Success",
    userId: user._id,
    role: user.role,
    token,
    email,
    Designatedzone: user.Designatedzone,
    fullName,
  });
});

exports.logout = AsyncErrorHandler(async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to log out!");
    }
    res.clearCookie("connect.sid");
    res.send("Logged out successfully!");
  });
});

exports.protect = AsyncErrorHandler(async (req, res, next) => {
  if (req.session && req.session.isLoggedIn) {
    req.user = req.session.user;
    return next();
  }
  const testToken = req.headers.authorization;
  let token;
  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }
  if (!token) {
    return next(new CustomError("You are not logged in!", 401));
  }
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR
  );

  const user = await User.findById(decodedToken.id);

  if (!user) {
    return next(
      new CustomError("The user with the given token does not exist", 401)
    );
  }
  const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);

  if (isPasswordChanged) {
    return next(
      new CustomError(
        "The password has been changed recently. Please log in again.",
        401
      )
    );
  }

  req.session.user = {
    id: user._id,
    email: user.email,
    role: user.role,
    FirstName: user.FirstName,
    LastName: user.LastName,
    Middle: user.Middle,
  };
  req.session.isLoggedIn = true;
  req.user = user;
  next();
});

exports.restrict = (role) => {
  return (req, res, next) => {
    if (!req.session || !req.session.isLoggedIn) {
      return res.status(401).json({
        message:
          "You are not logged in. Please log in to access this resource.",
      });
    }

    if (req.session.user.role !== role) {
      return res.status(403).json({
        message: `You do not have permission to access this resource. Required role: ${role}`,
      });
    }

    next();
  };
};

exports.forgotPassword = AsyncErrorHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    console.log("req.body", req.body);

    // Find the user based on email
    const user = await User.findOne({ email });

    // If user doesn't exist, trigger an error and return
    if (!user) {
      return next(
        new CustomError("We could not find the user with given email", 404)
      );
    }

    // Generate the reset token and save it in the user's document
    const resetToken = user.createResetTokenPassword();
    await user.save({ validateBeforeSave: false });

    // Generate the reset URL
    const resetUrl = `https://web-based-newborn-tracking-system.onrender.com/reset-password/${resetToken}`;
    const message = `We have received a password reset request. Please use the below link to reset your password:\n\n${resetUrl} \n\nThis reset password link will be available for 10 minutes.`;

    try {
      // Send the email with the reset link
      await sendEmail({
        email: user.email,
        subject: "Password change request received",
        text: message,
      });


      res.status(200).json({
        status: "Success",
        message: "Password reset link sent to the user email",
      });
    } catch (err) {
      console.error("Error sending email:", err);

      // Reset the token fields if email sending fails
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new CustomError(
          "There was an error sending password reset email. Please try again later",
          500
        )
      );
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return next(
      new CustomError(
        "An unexpected error occurred. Please try again later.",
        500
      )
    );
  }
});


exports.verifyOtp = AsyncErrorHandler(async (req, res, next) => {
  const { otp, userId } = req.body;

  if (!otp || !userId) {
    return res.status(400).json({
      message: "Both OTP and userId are required.",
    });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: "User is already verified" });
  }
  if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  return res.status(200).json({
    message: "Email Verified Successfully",
    data: {
      _id: user._id,
      username: user.username,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
});

exports.resetPassword = AsyncErrorHandler(async (req, res, next) => {
  const { token, password } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Token is Invalid or Expired", 400));
  }
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.passwordChangedAt = Date.now();

  await user.save();

  return res.status(200).json({
    status: "Success",
  });
});

exports.updatePassword = AsyncErrorHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return next(new CustomError("User not found.", 404));
  }

  const isMatch = await user.comparePasswordInDb(
    req.body.currentPassword,
    user.password
  );
  if (!isMatch) {
    return next(
      new CustomError("The current password you provided is wrong", 401)
    );
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});
