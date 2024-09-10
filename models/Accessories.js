import { model, Schema } from "mongoose";

const AccessoriesSchema = new Schema(
  {
    displayName: String,
    modelCategory: {
      type: String,
      default: "Consumable",
    },
    quantity: Number,
    stockroom: {
      type: String,
      default: "Singapore (SG) - Binnies",
    },
  },
  {
    timestamps: true,
  }
);

export default model("Accessories", AccessoriesSchema);
