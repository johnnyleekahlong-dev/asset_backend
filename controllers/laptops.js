import asyncHandler from "../utils/asyncHandler.js";
import Laptop from "../models/Laptop.js";
import ExpressError from "../utils/ExpressError.js";
import { trusted } from "mongoose";

const today = new Date();

const addLaptop = asyncHandler(async (req, res, next) => {
  const {
    assetTag,
    serialNumber,
    model,
    category,
    remark,
    location,
    warrantyExpiredAt,
  } = req.body;
  if (
    !assetTag ||
    !serialNumber ||
    !model ||
    !category ||
    !location ||
    !warrantyExpiredAt
  ) {
    return next(new ExpressError("All fields are required", 400));
  }

  const laptop = new Laptop({
    assetTag,
    serialNumber,
    model,
    category,
    remark,
    location,
    warrantyExpiredAt,
  });

  await laptop.save();

  res.status(201).json(laptop);
});

const deleteLaptop = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  await Laptop.findByIdAndDelete(id);

  res.status(200).json({ message: `Laptop with id ${id} has been deleted` });
});

const getLaptops = asyncHandler(async (req, res, next) => {
  if (req.query.page) {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 20;
    const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;
    const total = await Laptop.countDocuments();

    const laptops = await Laptop.find()
      .skip(startIndex)
      .limit(limit)
      .sort("assetTag");

    res.status(200).json({
      laptops,
      total,
    });
  } else {
    const laptops = await Laptop.find();
    res.status(200).json(laptops);
  }
});

const getLaptop = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const laptop = await Laptop.findById(id).populate({
    path: "assignedTo",
    select: "username email",
  });

  res.status(200).json(laptop);
});

const updateLaptop = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  Laptop.updateOne(
    { _id: id },
    req.body,
    { new: true },
    function (err, result) {
      if (err) {
        next(new ExpressError(err.message, 500));
      } else {
        res.status(200).json(result);
      }
    }
  );
});

const getExportedLaptops = asyncHandler(async (req, res, next) => {
  const laptops = await Laptop.find({})
    .populate({
      path: "assignedTo",
      select: "_id username email",
    })
    .sort("assetTag");

  const data = laptops.map((laptop) => {
    return {
      assetTag: laptop?.assetTag,
      serialNumber: laptop?.serialNumber,
      model: laptop?.model,
      category: laptop?.category,
      warrantyExpiredAt: new Date(laptop?.warrantyExpiredAt).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),
      assignedTo: `${laptop.assignedTo.username} || ${laptop.assignedTo.email}`,
    };
  });

  res.status(200).json(data);
});

const getSummarize = asyncHandler(async (req, res) => {
  let laptops = await Laptop.find({}).populate({
    path: "assignedTo",
    select: "_id username email",
  });

  const totalLaptops = await Laptop.find();

  laptops = laptops.filter(
    (laptop) => laptop.assignedTo.username !== "in-stock"
  );

  res.status(200).json({
    totalLaptops: totalLaptops.length,
    activeLaptops: laptops.length,
    inStock: totalLaptops.length - laptops.length,
  });
});

const getActiveLaptops = asyncHandler(async (req, res, next) => {
  let laptops;

  laptops = await Laptop.find({}).populate({
    path: "assignedTo",
    select: "_id username email",
  });

  laptops = laptops.filter(
    (laptop) => laptop.assignedTo.username !== "in-stock"
  );

  laptops = laptops.map((laptop) => {
    return {
      assetTag: laptop.assetTag,
      serialNumber: laptop.serialNumber,
      model: laptop.model,
      category: laptop.category,
      warrantyExpiredAt: new Date(laptop?.warrantyExpiredAt).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),
      assignedTo: `${laptop.assignedTo.username} || ${laptop.assignedTo.email}`,
    };
  });

  res.status(200).json(laptops);
});

const getActiveButWarrantyExipredLaptops = asyncHandler(
  async (req, res, next) => {
    let laptops;

    laptops = await Laptop.find({}).populate({
      path: "assignedTo",
      select: "_id username email",
    });

    laptops = laptops?.filter((laptop) => {
      if (
        new Date(laptop.warrantyExpiredAt) < today &&
        laptop.assignedTo.username !== "in-stock" &&
        laptop.warrantyExpiredAt !== undefined
      ) {
        return true;
      } else {
        return false;
      }
    });

    laptops = laptops.map((laptop) => {
      return {
        assetTag: laptop.assetTag,
        serialNumber: laptop.serialNumber,
        model: laptop.model,
        category: laptop.category,
        warrantyExpiredAt: new Date(
          laptop?.warrantyExpiredAt
        ).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        assignedTo: `${laptop.assignedTo.username} || ${laptop.assignedTo.email}`,
      };
    });

    res.status(200).json(laptops);
  }
);

const getInStockLaptops = asyncHandler(async (req, res, next) => {
  let laptops;

  laptops = await Laptop.find({}).populate({
    path: "assignedTo",
    select: "_id username email",
  });

  laptops = laptops.filter(
    (laptop) => laptop.assignedTo.username === "in-stock"
  );

  laptops = laptops.map((laptop) => {
    return {
      assetTag: laptop.assetTag,
      serialNumber: laptop.serialNumber,
      model: laptop.model,
      category: laptop.category,
      warrantyExpiredAt: new Date(laptop?.warrantyExpiredAt).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),
      assignedTo: `${laptop.assignedTo.username} || ${laptop.assignedTo.email}`,
    };
  });

  res.status(200).json(laptops);
});

const updateAllLaptopsLocation = asyncHandler(async (req, res, next) => {
  const { location } = req.body;
  const laptops = await Laptop.updateMany({ location });

  res.status(200).json(laptops);
});

const laptopsController = {
  addLaptop,
  deleteLaptop,
  getLaptop,
  getLaptops,
  updateLaptop,
  getExportedLaptops,
  getSummarize,
  getActiveLaptops,
  getInStockLaptops,
  getActiveButWarrantyExipredLaptops,
  updateAllLaptopsLocation,
};

export default laptopsController;
