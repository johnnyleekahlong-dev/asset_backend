import Accessories from "../models/Accessories.js";
import ExpressError from "../utils/ExpressError.js";
import asyncHandler from "../utils/asyncHandler.js";

const getAccessories = asyncHandler(async (req, res, next) => {
  const accessories = await Accessories.find();

  res.status(200).json(accessories);
});

const createAccessories = asyncHandler(async (req, res, next) => {
  const { displayName, modelCategory, quantity, stockroom } = req.body;
  if ((!displayName || !modelCategory, !quantity)) {
    next(new ExpressError("All fields required", 400));
  }
  const newAccessories = new Accessories({
    displayName,
    modelCategory,
    quantity,
    stockroom,
  });
  await newAccessories.save();
  res.status(201).json(newAccessories);
});

const getAccessoriesById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const accessories = await Accessories.findById(id);

  res.status(200).json(accessories);
});

const updateAccessories = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    next(new ExpressError("Missing ID", 400));
  }
  const updatedAccessories = await Accessories.findOneAndUpdate(
    { _id: id },
    req.body,
    { new: true }
  );
  res.status(200).json(updatedAccessories);
});

const accessoriesController = {
  getAccessories,
  createAccessories,
  getAccessoriesById,
  updateAccessories,
};

export default accessoriesController;
