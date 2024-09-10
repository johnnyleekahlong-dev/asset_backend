import Employee from "../models/Employee.js";
import asyncHandler from "../utils/asyncHandler.js";
import ExpressError from "../utils/ExpressError.js";

const getEmployees = asyncHandler(async (req, res, next) => {
  if (req.query.page) {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 20;
    const startIndex = (page - 1) * limit;
    const total = await Employee.countDocuments();

    const employees = await Employee.find()
      .skip(startIndex)
      .limit(limit)
      .sort("userId");

    res.status(200).json({
      employees,
      total,
    });
  } else {
    const employees = await Employee.find();
    res.status(200).json(employees);
  }
});

const getEmployee = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const employee = await Employee.findById(id).populate({
    path: "assignedLaptop",
    select: "assetTag model",
  });

  res.status(200).json(employee);
});

const deleteEmployee = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  await Employee.deleteOne({ _id: id });
  res.status(200).json({ message: `Employee with ${id} has been deleted` });
});

const createEmployee = asyncHandler(async (req, res, next) => {
  // console.log(req.body);
  const { userId, username, email, location } = req.body;

  if (!userId || !username || !email || !location) {
    return next(new ExpressError("All fields are required", 400));
  }

  const employee = new Employee({
    userId,
    username,
    email,
    location,
  });

  await employee.save();

  res.send("Employee created successfully");
});

const updateEmployee = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const employee = await Employee.findById(id);

  if (!employee) {
    return next(new ExpressError(`No employee found with ID ${id}`, 400));
  }

  const updatedEmployee = await Employee.findByIdAndUpdate(
    id,
    {
      userId: req.body.userId,
      username: req.body.username,
      email: req.body.email,
      location: req.body.location,
      assignedAccessories: req.body.assignedAccessories,
    },
    { new: true }
  );

  res.status(200).json(updatedEmployee);
});

const updateEmployeeAccessories = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const updatedEmployee = await Employee.updateOne(
    { _id: id },
    { $set: { assignedAccessories: req.body.assignedAccessories } },
    { new: true, upsert: true }
  );

  res.status(200).json(updatedEmployee);
});

const employeesController = {
  getEmployee,
  getEmployees,
  deleteEmployee,
  createEmployee,
  updateEmployee,
  updateEmployeeAccessories,
};

export default employeesController;
