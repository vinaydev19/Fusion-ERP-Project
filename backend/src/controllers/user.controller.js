import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {
  ChangeEmailVerification,
  resetPasswordConfirmationEmail,
  resetPasswordEmail,
  sendVerificationCode,
  sendWelcomeEmail,
} from "../utils/EmailSender.js";
import jwt from "jsonwebtoken";

const option = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
};

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something want wrong while generate access and refresh token"
    );
  }
};

const userRegister = asyncHandler(async (req, res) => {
  const {
    fullName,
    username,
    email,
    phoneNo,
    profilePic,
    companyName,
    password,
    confirmPassword,
  } = req.body;

  if (
    [
      fullName,
      username,
      email,
      phoneNo,
      profilePic,
      companyName,
      password,
      confirmPassword,
    ].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Field are required");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "password and confirmPassword is not same");
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  const profilePicLocalPath = req.file?.path;

  console.log(req.files);

  if (!profilePicLocalPath) {
    throw new ApiError(400, "please upload profile pic");
  }

  const cloudinaryProfilePic = await uploadOnCloudinary(profilePicLocalPath);

  if (!cloudinaryProfilePic) {
    throw new ApiError(400, "something want wrong while upload profile pic");
  }

  const verficationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const user = await User.create({
    fullName,
    username,
    email,
    phoneNo,
    profilePic: cloudinaryProfilePic.url,
    companyName,
    password,
    verficationToken,
    verficationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedUser) {
    throw new ApiError(500, "something want wrong while register the user");
  }

  await sendVerificationCode(loggedUser.email, verficationToken);

  return res
    .status(200)
    .json(new ApiResponse(200, { loggedUser }, "user register successfully"));
});

const userVerification = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (code.trim() === "") {
    throw new ApiError(400, "please enter verification code");
  }

  const user = await User.findOne({
    verficationToken: code,
    verficationTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Inavlid or Expired Code");
  }

  user.isVerified = true;
  user.verficationToken = undefined;
  user.verficationTokenExpiresAt = undefined;
  await user.save({ validateBeforeSave: false });
  await sendWelcomeEmail(user.email, user.fullName);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email Verifed Successfully"));
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field.trim() === "")) {
    throw new ApiError(400, "All field are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "user not found");
  }

  if (!user.isVerified === true) {
    throw new ApiError(400, "user is not verify please verify with email");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        { user: loggedUser, accessToken, refreshToken },
        "user login successfully"
      )
    );
});

const userLogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "user logout successfully"));
});

const emailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError("field is required");
  }
  const verficationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const user = await User.findOne({ email }).select("-password -refreshToken");

  user.verficationToken = verficationToken;
  user.verficationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  await sendVerificationCode(user.email, verficationToken);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user },
        "verfication Code send to your email check your inbox"
      )
    );
});

const resetPasswordEmailVerfication = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "please enter your Email");
  }

  const user = await User.findOne({ email }).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(400, "user not found");
  }

  let length = 6;
  let token = "";
  let code = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890";
  for (let i = 0; i < length; i++) {
    let char = Math.floor(Math.random() * code.length);
    token += code[char];
  }
  console.log(token);

  user.resetPasswordToken = token;
  user.resetPasswordTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  await resetPasswordEmail(user.email, token);

  console.log(token);
  

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "reset Password code send your email please check your inbox"
      )
    );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { code, password, confirmPassword } = req.body;

  if ([code, password, confirmPassword].some((field) => field.trim() === "")) {
    throw new ApiError(400, "please enter verification code");
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, "password and confirmPassword not same");
  }

  const user = await User.findOne({
    resetPasswordToken: code,
    resetPasswordTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Inavlid or Expired Code");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpiresAt = undefined;
  await user.save({ validateBeforeSave: false });
  await resetPasswordConfirmationEmail(user.email, user.fullName);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password has been reset successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodeToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!decodeToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const user = await User.findById(decodeToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refreshToken is expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", newRefreshToken, option)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "new refresh generate successfully"
        )
      );
  } catch (error) { }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (
    [oldPassword, newPassword, confirmPassword].some((field) => field === "")
  ) {
    throw new ApiError(403, "all field are required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(403, "password and confirmPasswrod should be same");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(401, "unauthorized, request");
  }

  const isPasswordValidate = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValidate) {
    throw new ApiError(403, "old password incorrect");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password has been changed"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  // const id = req.params.userId;
  // const user = await User.findById(id).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const profilePicUpdate = asyncHandler(async (req, res) => {
  const profilePicLocalPath = req.file?.path;

  if (!profilePicLocalPath) {
    throw new ApiError(403, "profile Pic is required");
  }

  const cloudinaryProfilePic = await uploadOnCloudinary(profilePicLocalPath);

  if (!cloudinaryProfilePic) {
    throw new ApiError(403, "something want wrong while upload profile Pic");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        profilePic: cloudinaryProfilePic.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "profile Pic is update successfully"));
});

const updateUserAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, username, phoneNo, companyName, description } = req.body;

  if (
    [fullName, username, phoneNo, companyName].some(
      (field) => field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        username,
        phoneNo,
        companyName,
        description,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const emailChangeVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const userId = req.user?._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(401, "unauthorized request");
  }

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    throw new ApiError(400, "this email is already registered");
  }

  let emailUpdate;

  if (email && email !== user.email) emailUpdate = email;

  const verficationToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const updateUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        isVerified: false,
        email: emailUpdate,
        verficationToken,
        verficationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  await ChangeEmailVerification(updateUser.email, verficationToken);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updateUser },
        "verfication Code send to your email check your inbox"
      )
    );
});

const emailChangeConfirmation = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (code.trim() === "") {
    throw new ApiError(400, "please enter verification code");
  }

  const user = await User.findOne({
    verficationToken: code,
    verficationTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Inavlid or Expired Code");
  }

  user.isVerified = true;
  user.verficationToken = undefined;
  user.verficationTokenExpiresAt = undefined;
  await user.save({ validateBeforeSave: false });
  await emailChangeConfirmation(user.email, user.fullName);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "your email has been changed successfully"));
});

const getOtherUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");

  if (!users.length) {
    throw new ApiError(404, "No other users found.")
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { users }, "other users founded"));

});

export {
  userRegister,
  userVerification,
  userLogin,
  userLogout,
  emailVerification,
  resetPasswordEmailVerfication,
  resetPassword,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  profilePicUpdate,
  updateUserAccountDetails,
  emailChangeConfirmation,
  emailChangeVerification,
  getOtherUsers
};
