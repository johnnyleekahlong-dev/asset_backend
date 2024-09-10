import asyncHandler from "../utils/asyncHandler.js";
import ExpressError from "../utils/ExpressError.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const login = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies;
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ExpressError("All fields are required", 400));
  }

  const user = await User.findOne({ email }).exec();

  if (!user) {
    return next(new ExpressError("No user found", 401));
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ExpressError("Invalid credentials", 401));
  }

  let newRefreshTokenArray = !cookies?.jwt
    ? user.refreshToken
    : user.refreshToken.filter((rt) => rt !== cookies.jwt);

  if (cookies?.jwt) {
    const refreshToken = cookies.jwt;
    const token = await User.findOne({ refreshToken }).exec();

    if (!token) {
      newRefreshTokenArray = [];
    }

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
  }

  const newRefreshToken = user.getJwtRefreshToken(); //1d
  const accessToken = user.getJwtAccessToken(); //30m

  user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
  await user.save();

  res.cookie("jwt", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({ id: user._id, accessToken });
});

const register = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return next(new ExpressError("All fields are required", 400));

  const duplicate = await User.findOne({ email });
  if (duplicate) return next(new ExpressError("Duplicated found", 409));

  const user = new User({
    username,
    email,
    password,
  });

  await user.save();

  res.status(201).json(user);
});

const refresh = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    res.sendStatus(401);
    next(new ExpressError("Not authorized", 401));
    return;
  }

  const refreshToken = cookies.jwt;

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  const user = await User.findOne({ refreshToken }).exec();

  if (!user) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) return res.sendStatus(403);
        const hackedUser = await User.findOne({
          username: decoded.username,
        }).exec();
        hackedUser.refreshToken = [];
        await hackedUser.save();
      }
    );
    return res.sendStatus(403);
  }

  // delete the existing refresh token
  const newRefreshTokenArray = user.refreshToken.filter(
    (rt) => rt !== refreshToken
  );

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        user.refreshToken = [...newRefreshTokenArray];
        await user.save();
      }

      if (err || user.username !== decoded.username) {
        return res.sendStatus(403);
      }

      const accessToken = user.getJwtAccessToken();
      const newRefreshToken = user.getJwtRefreshToken();

      user.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      await user.save();

      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken });
    }
  );
});

const logout = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(204);
  const refreshToken = cookies.jwt;

  const user = await User.findOne({ refreshToken }).exec();
  if (!user) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.status(204);
  }

  user.refreshToken = user.refreshToken.filter((rt) => rt !== refreshToken);
  await user.save();

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  res.status(204).json({ message: "logout" });
});

const authController = {
  login,
  logout,
  register,
  refresh,
};

export default authController;
