import mongoose, { Schema, model } from "mongoose";

const TransactionSchema = new Schema(
  {
    laptop: mongoose.Schema.ObjectId,
    actionDetail: String,
    actionDate: String,
  },
  { timestamps: true }
);

export default model("Transaction", TransactionSchema);
