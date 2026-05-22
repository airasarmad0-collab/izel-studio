const { Schema, model } = require("mongoose");

const VolumeSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required!"],
      maxlength: [60, "Name must be less than 60 characters!"],
      trim: true,
      unique: [true, "Name of volume must be unique from one another"],
    },

    description: {
      type: String,
      maxlength: [250, "Description must not be more than 250 characters!"],
      trim: true,
      required: [
        false,
        "Description is not required to create a volume! its totally optional",
      ],
    },

    tags: {
      type: [String],
      validate: {
        validator: function (value) {
          return value.length <= 10;
        },
        message: "Only 10 tags are allowed!",
      },
      default: [],
    },
    metaTitle: {
      type: String,
      required: [true, "Meta Title is required!"],
      maxlength: [60, "Name must be less than 60 characters!"],
      trim: true,
    },
    metaDescription: {
      type: String,
      required: [
        false,
        "Meta description is not required! , its totally optional",
      ],
      maxlength: [250, "Description must not be more than 250 characters!"],
    },
  },
  {
    timestamps: true,
  },
);

const VolumeModel = model("Volume", VolumeSchema);
module.exports = VolumeModel;
