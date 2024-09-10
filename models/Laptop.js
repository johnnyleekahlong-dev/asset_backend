import mongoose, { model, Schema } from "mongoose";
import Transaction from "./Transaction.js";
import Employee from "./Employee.js";

const LaptopSchema = new Schema(
  {
    assetTag: String,
    serialNumber: String,
    model: String,
    category: String,
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: "Professional",
      default: "62baa3b60d6245d92ba0d613",
    },
    remark: {
      type: String,
      default: "",
    },
    location: String,
    warrantyExpiredAt: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

LaptopSchema.pre("updateOne", async function (next) {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const old = await this.model.findOne(this.getQuery());
  const oldUserId = old.assignedTo;
  const oldUser = await Employee.findById(oldUserId);
  const newUser = await Employee.findById(this.getUpdate().assignedTo);

  await Transaction.create({
    laptop: old._id,
    actionDetail: `laptop reassigned to ${newUser.email} from ${oldUser.email}`,
    actionDate: date,
  });
  next();
});

export default model("Laptop", LaptopSchema);
