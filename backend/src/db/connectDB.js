import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    console.log(
      `successfully connected to db || ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`Error on while connect the db || ${error}`);
    process.exit(1);
  }
};

export default connectDB;
