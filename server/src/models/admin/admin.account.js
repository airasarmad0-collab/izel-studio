const { Schema, model } = require("mongoose");

const AdminSchema = new Schema(
  {
    name: {
      unique: true,
      type: String,
      minlength: [4, "Name must be more than 4 characters!"],
      maxlength: [25, "Name must be less than 25 characters!"],
      required: [true, "Name is required to create your account"],
    },
    email: {
      unique: true,
      type: String,
      lowercase: [true, "Email must be lowercase!"],
      required: [true, "Email is required to create your account"],
      maxlength: [25, "Email must be less than 25 characters!"],
      trim: true,
      regex: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Email must be correct!",
      ],
    },
    password: {
      unique: false,
      type: String,
      select: false,
    },
  },
  {
    timeseries: true,
  },
);

const AdminAccountModel = model("AdminAccount", AdminSchema);
module.exports = AdminAccountModel;
