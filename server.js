import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Database from "./config/database.js";
import corsOptions from "./config/corsOptions.js";
import credentials from "./middlewares/credentials.js";
import cookieParser from "cookie-parser";
import verifyJWT from "./middlewares/verifyJWT.js";
import errorHandler from "./middlewares/errorHandler.js";
import Employee from "./models/Employee.js";
import mongoose from "mongoose";

// routes
import authRoute from "./routes/auth.js";
import usersRoute from "./routes/user.js";
import laptopsRoute from "./routes/laptops.js";
import employeesRoute from "./routes/employees.js";
import accessoriesRoute from "./routes/accessories.js";

import laptopsController from "./controllers/laptops.js";

dotenv.config({ path: "config/config.env" });

const app = express();
const port = process.env.PORT;
const db = new Database(process.env.MONGODB_URI);

db.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(credentials);
app.use(cors(corsOptions));
app.use(cookieParser());

// public routes
app.use("/api/auth", authRoute);
app.use("/api/laptops/summary", laptopsController.getSummarize);
// app.post("/api/laptops/update", laptopsController.updateAllLaptopsLocation);

// private routes
app.use(verifyJWT);
app.use("/api/users", usersRoute);
app.use("/api/laptops", laptopsRoute);
app.use("/api/employees", employeesRoute);
app.use("/api/accessories", accessoriesRoute);

app.use(errorHandler);

app.listen(port, async () => {
  console.log(`Server is running on port: ${port}`);

  try {
    const existingUser = await Employee.findById("62baa3b60d6245d92ba0d613");

    if (existingUser) return;
    // Create the default account if not found
    const defaultAcc = new Employee({
      _id: mongoose.Types.ObjectId("62baa3b60d6245d92ba0d613"),
      userId: "default",
      username: "default",
      email: "default@default.com",
      location: "default",
    });
    await defaultAcc.save();
    console.log("Default account created successfully.");
  } catch (error) {
    console.error("Error checking or creating default account:", error);
  }
});

export default app;
