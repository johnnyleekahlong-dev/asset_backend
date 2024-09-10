import { model, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const UserSchema = new Schema(
  {
    username: String,
    email: String,
    password: String,
    lastPasswordChange: {
      type: Date,
      required: true,
      default: Date.now,
    },
    roles: {
      User: {
        type: Number,
        default: 2001,
      },
      Editor: Number,
      Admin: Number,
    },
    refreshToken: [String],
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.getJwtAccessToken = function () {
  return jwt.sign(
    {
      UserInfo: {
        username: this.username,
        roles: Object.values(this.roles),
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "30m",
    }
  );
};

UserSchema.methods.getJwtRefreshToken = function () {
  return jwt.sign(
    { username: this.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );
};

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getPasswordResetToken = async function () {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256");
  const encryptTokenString = hash.update(token).digest().toString("hex");

  this.passwordResetToken = encryptTokenString;
  this.passwordResetToken = Date.now() + 10 * 60 * 1000;

  return token;
};

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

export default model("User", UserSchema);
