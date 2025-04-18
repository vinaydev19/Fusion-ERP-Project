import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(`error on express app ${error}`);
    });

    app.listen(port, () => {
      console.log(`server running on port no : ${port}`);
    });
  })
  .catch((error) => {
    console.log(`failed to connect the db ${error}`);
  });
