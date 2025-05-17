const User = require("../Models/usermodel");
const AsyncErrorHandler = require("../Utils/AsyncErrorHandler");
const jwt = require("jsonwebtoken");
const CustomError = require("../Utils/CustomError");
const util = require("util");
const sendEmail = require("../Utils/email");
const crypto = require("crypto");

//ito ay function para sa secret code
const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    //importante ito dapat tugma siya sa back-end o sa app.js na session sa ttl and sa maxage
    expiresIn: "1d", // 1 day
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
  //para hindi masama ang password fields sa Output
  //ma save sa databased but not view for in Output
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
    password,
    role,
    avatar,
    address,
    phoneNumber,
    dateOfBirth,
    gender,
    zone,
  } = req.body;

  // Create an array to collect missing fields
  const missingFields = [];

  // Check if any required fields are missing
  if (!FirstName) missingFields.push("First Name");
  if (!LastName) missingFields.push("Last Name");
  if (!email) missingFields.push("Email");
  if (!password) missingFields.push("Password");
  if (!address) missingFields.push("Address");
  if (!dateOfBirth) missingFields.push("Date Of Birth");
  if (!gender) missingFields.push("Gender");
  

  // If there are any missing fields, return them in the response
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `The following fields are required: ${missingFields.join(", ")}`,
    });
  }

  try {
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      // If user already exists, send an appropriate response
      return res
        .status(400)
        .json({ message: "User with this email already exists!" });
    }

    // If no user exists, create a new user
    const newUser = await User.create({
      FirstName,
      LastName,
      email,
      password,
      role,
      avatar,
      address,
      phoneNumber,
      dateOfBirth,
      gender,
      zone,
    });

    // Send the newly created user as the response
    return res.send({
      status: "Success",
      data: newUser,
    });
  } catch (error) {
    // Handle any errors during user creation or email check
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
    return next(new CustomError("Incorrect email or password", 400)); // It could be here
  }

  // Step 2: Check if password is correct
  const isPasswordCorrect = await user.comparePasswordInDb(
    password,
    user.password
  );

  if (!isPasswordCorrect) {
    console.log("Password mismatch, throwing error");
    return next(new CustomError("Incorrect email or password", 400)); // Or here
  }

  // Step 3: Proceed to create JWT token
  const token = signToken(user._id);

  // Step 4: Set session and respond
  req.session.userId = user._id;
  req.session.isLoggedIn = true;
  req.session.user = {
    email: user.email,
    FirstName: user.FirstName,
    LastName: user.LastName,
    role: user.role,
  };

  const fullName = `${user.FirstName} ${user.LastName}`;

  // Respond
  return res.status(200).send({
    status: "Success",
    userId: user._id,
    role: user.role,
    token,
    email,
    fullName,
  });
});

exports.logout = AsyncErrorHandler(async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to log out!");
    }
    res.clearCookie("connect.sid"); // Clearing the session cookie
    res.send("Logged out successfully!");
  });
});

exports.protect = AsyncErrorHandler(async (req, res, next) => {
  // 1. Check for session first
  if (req.session && req.session.isLoggedIn) {
    // If the session is active, attach user from session to req object
    req.user = req.session.user;
    return next(); // User is logged in, proceed to the next middleware or route handler
  }

  // 2. If no session, fall back to token authentication
  const testToken = req.headers.authorization;
  let token;

  // Check if the token starts with 'Bearer' and extract the token
  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }

  // If no token, throw an error that the user is not logged in
  if (!token) {
    return next(new CustomError("You are not logged in!", 401));
  }

  // 3. Validate the token
  // Ensure the token is valid using the secret from the environment variables
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR
  );

  // Find the user by the decoded token ID
  const user = await User.findById(decodedToken.id);

  // If no user with that ID exists, throw an error
  if (!user) {
    return next(
      new CustomError("The user with the given token does not exist", 401)
    );
  }

  // Check if the user changed the password after the token was issued
  const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);

  // If the password has been changed, throw an error
  if (isPasswordChanged) {
    return next(
      new CustomError(
        "The password has been changed recently. Please log in again.",
        401
      )
    );
  }

  // 4. Save the user in the session
  req.session.user = {
    id: user._id,
    email: user.email,
    role: user.role,
    FirstName: user.FirstName,
    LastName: user.LastName,
    Middle: user.Middle,
  };
  req.session.isLoggedIn = true;

  // Attach the user to the request object to use in the next middleware
  req.user = user;

  // Proceed to the next middleware or route
  next();
});

// Restrict access based on role
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
  const { email } = req.body;

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
  const resetUrl = `https://myapp-xk0w.onrender.com/reset_password/${resetToken}`;
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
    // Reset the password reset token and expiry fields on error
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
});

exports.resetPassword = AsyncErrorHandler(async (req, res, next) => {
  const { token, password } = req.params; // Get the token from the request parameters

  // Hash the token to compare with the stored token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find the user with the matching hashed token and not expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() }, // Ensure the token is not expired
  });

  // Check if the user exists
  if (!user) {
    return next(new CustomError("Token is Invalid or Expired", 400)); // Use next to pass error to error handler
  }

  // Set the new password based on input from the request body
  user.password = req.body.password; // Assuming password validation is handled in the User model
  user.passwordResetToken = undefined; // Clear the reset token
  user.passwordResetTokenExpires = undefined; // Clear the token expiry
  user.passwordChangedAt = Date.now(); // Update the timestamp for when the password was changed

  // Save the updated user object
  await user.save(); // Await this to catch any potential errors

  return res.status(200).json({
    status: "Success",
  });
});
