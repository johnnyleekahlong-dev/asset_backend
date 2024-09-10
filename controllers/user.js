import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ExpressError from "../utils/ExpressError.js";

const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json(user);
});

const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json(users);
});

const resetOtherPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword, confirmNewPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    next(new ExpressError("No user found in database", 400));
  }

  if (newPassword !== confirmNewPassword) {
    next(new ExpressError("Passwords do not match", 400));
  }

  user.password = newPassword;
  user.lastPasswordChange = Date.now();

  await user.save();

  res.status(200).json({ message: "Password updated" });
});

const createUser = asyncHandler(async (req, res, next) => {
  const { username, email } = req.body;
  if (!username || !email) {
    next(new ExpressError("All fields are required", 400));
  }
  const defaultPassword = "password123";
  const user = new User({
    username,
    email,
    password: defaultPassword,
  });

  await user.save();

  res.status(200).json({ message: "New user created" });
});

const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    next(new ExpressError("Invalid id", 400));
  }

  await User.findByIdAndDelete(id);

  res.status(200).json({ message: `${id} deleted from database` });
});

const fetchUserByEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.params;
  if (!email) {
    next(new ExpressError("Invalid email", 400));
  }

  const user = await User.findOne({ email }).select("-password");

  res.status(200).json(user);
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const now = Date.now();
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const user = await User.findById(id);
  if (!user) {
    next(new ExpressError("No user found in database", 404));
  }

  const isMatch = await user.matchPassword(oldPassword);

  if (!isMatch) {
    next(new ExpressError("Invalid credentials", 404));
  }

  if (newPassword !== confirmNewPassword) {
    next(new ExpressError("Passwords do not match", 404));
  }
  //admin: 5150, user: 2001

  if (req.roles.includes(5150)) {
    user.password = newPassword;
    user.lastPasswordChange = now;
    await user.save();

    res.json(200).json({ message: "Password changed successfully" });
  }

  if (req.roles.includes(2001)) {
    const timeSinceLastChange = now - user.lastPasswordChange;
    const passwordChangeInterval = 60 * 60 * 1000; //60 minutes
    if (timeSinceLastChange >= passwordChangeInterval) {
      //password can be changed
      user.password = newPassword;
      user.lastPasswordChange = now;
      await user.save();
      res.json(200).json({ message: "Password changed successfully" });
    } else {
      next(
        new ExpressError(
          "Password can only be changed 60 minutes later from last password change"
        )
      );
    }
  }
});

const usersController = {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  changePassword,
  resetOtherPassword,
  fetchUserByEmail,
};

export default usersController;
