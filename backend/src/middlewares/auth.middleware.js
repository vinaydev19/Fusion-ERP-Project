import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {


  try {
    // console.log("🔍 Incoming Cookies:", req.cookies); // Debugging

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    // console.log("🔍 Extracted Token:", token); // Check if token is received

    if (!token) {
      return res.status(401).json({ message: "No access token provided" });
    }
    
    const decodedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    if (!decodedToken) {
      throw new ApiError(401, "unauthorized request");
    }

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ JWT Verification Failed:", error.message);

    throw new ApiError(401, error.message || "invalid access token");
  }
});

export default verifyJWT;
