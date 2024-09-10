import { model, Schema } from "mongoose";
import Laptop from "./Laptop.js";
import Transaction from "./Transaction.js";

const EmployeeSchema = new Schema(
  {
    userId: String,
    username: String,
    email: String,
    location: String,
    assignedAccessories: [
      String,
      // {
      //   name: {
      //     type: String,
      //   },
      //   quantity: {
      //     type: Number,
      //   },
      // },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// reverse population
EmployeeSchema.virtual("assignedLaptop", {
  ref: "Laptop",
  localField: "_id",
  foreignField: "assignedTo",
  jsutOne: false,
});

EmployeeSchema.pre("deleteOne", async function (next) {
  const today = new Date();
  const date = `${today.getFullYear()}-${
    today.getMonth() + 1
  }-${today.getDate()}`;

  const filter = this.getFilter(); // Get the filter object from the query
  const employee = await this.model.findOne(filter);

  if (employee) {
    const laptop = await Laptop.findOne({ assignedTo: employee._id });
    if (laptop) {
      await Laptop.findOneAndUpdate(
        { assignedTo: employee._id },
        { assignedTo: "62baa3b60d6245d92ba0d613" },
        { new: true, runValidators: true }
      );
      await Transaction.create({
        laptop: laptop._id,
        actionDetail: `${employee.email} deleted and returned laptop with asset tag: ${laptop.assetTag}`,
        actionDate: date,
      });
    } else {
      console.log(
        `Employee ${employee.email} deleted and didn't hold laptop before`
      );
      await Transaction.create({
        laptop: null,
        actionDetail: `${employee.email} deleted and didn't hold laptop before`,
        actionDate: date,
      });
    }
  }

  next();
});

export default model("Professional", EmployeeSchema);
