const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorhandler');
const sendToken = require('../utils/sendToken');
const generateOTP = require('../utils/generateOtp');

// Register a new user
exports.register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  const userEmail = await User.findOne({ email });

  if (userEmail) {
    return next(new ErrorHandler(`Email ${email} already exists`, 400));
  }

  const otp = generateOTP() // Generate a 6-digit OTP
  console.log(otp);
  const otpExpiry = Date.now() + 10 * 60 * 1000;
  const user = await User.create({
    name, email, password,
    otp,
    otpExpiry,
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    service: 'gmail',
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: email,
    subject: 'Email Verification Code',
    text: `Your OTP for email verification is ${otp}. It is valid for 10 minutes.`,
  };


  await transporter.sendMail(mailOptions);
  res.status(200).json({
    success: true,
    message: `Registration successful. Please verify your email using the OTP sent to your email. ${otp}`,
  });
  // Call sendToken with the correct parameters
  // sendToken(user, 201, res); 
});

// Verify user by OTP
exports.verifyUser = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (user.isVerified) {
    return res.status(200).json({
      success: true,
      message: 'User is already verified.',
    });
  }

  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    return next(new ErrorHandler("Invalid or expired OTP", 400));
  }

  // Set user as verified and clear OTP
  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;
  user.verifiedAt = Date.now();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User verified successfully.',
  });
});

// Resend OTP
exports.resendOtp = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (user.isVerified) {
    return res.status(200).json({
      success: true,
      message: 'User is already verified.',
    });
  }

  const otp = generateOTP() // Generate new OTP
  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // Set new OTP expiration

  await user.save();

  // Send OTP email
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    service: 'gmail',
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: email,
    subject: 'Resend OTP for Email Verification',
    text: `Your new OTP for email verification is ${otp}. It is valid for 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({
    success: true,
    message: `OTP ${otp} has been resent to your email.`,
  });
});

// Login user
exports.login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password );
  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Check if the user is verified
  if (!user.isVerified) {
    return next(new ErrorHandler("Your account is not verified. Please verify your email first.", 403));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(user, 200, res, req);
});

// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forgot Password send otp to email
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("User Not Found", 404));
  }

  // Generate a reset token (JWT)
  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '10m', // Token expires in 10 minutes
  });

  // Create the reset password URL
  // const resetUrl = `${req.protocol}://${req.get('host')}/api/users/reset-password/${resetToken}`;

  const resetUrl = `http://localhost:3000/password/reset/${resetToken}`;

  // Construct the message
  const message = `You requested a password reset. Please use the following link to reset your password: ${resetUrl}`;

  // Set up email transport using SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    service: 'gmail', // You can use your preferred email service
    auth: {
      user: process.env.SMPT_MAIL, // Your email address (e.g., example@gmail.com)
      pass: process.env.SMPT_PASSWORD, // Your email password or App-specific password
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: email,
    subject: 'Password Reset Request',
    text: message, // Using the message string here
  };
  console.log("resetToken:", resetToken);

  // Send the email
  await transporter.sendMail(mailOptions);

  // Send a response back
  res.status(200).json({
    success: true,
    message: `Reset link sent to your email. Please check your inbox for the link.`,
  });
});

// resetPassword
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { newPassword } = req.body;
  const { resetToken } = req.params;

  // Verify the JWT token
  console.log("resetPassword", resetToken);
  let decoded;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SECRET); // Verify the reset token
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired reset token", 400));
  }

  // Find the user by decoded ID
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Update the user's password
  user.password = newPassword;

  await user.save();

  // Send success response
  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully',
  });
});

// getUser
exports.getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Change Password
exports.changePassword = catchAsyncErrors(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  const isPasswordMatched = await user.comparePassword(currentPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler('Current password is incorrect', 401));
  }

  user.password = newPassword;
  const message = "Password update successfully"
  await user.save();

  sendToken(user, 200, res, req, message);
});

// updateProfile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
  };

  // if (req.body.avatar && req.body.avatar !== "") {
  //   const user = await User.findById(req.user.id);

  //   const imageId = user.avatar.public_id;

  //   await cloudinary.v2.uploader.destroy(imageId);

  //   const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //     folder: "avatars",
  //     width: 150,
  //     crop: "scale",
  //   });

  //   newUserData.avatar = {
  //     public_id: myCloud.public_id,
  //     url: myCloud.secure_url,
  //   };
  // }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
  });
});