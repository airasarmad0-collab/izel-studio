const { Schema, model } = require("mongoose");

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required to create a product!"],
      trim: true,
      maxlength: [80, "Name must be less than 80 characters!"],
      unique: true,
    },

    description: {
      type: String,
      maxlength: [450, "Description must be less than 450 characters!"],
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (value) {
          return value.length <= 10;
        },
        message: "Only 10 tags are allowed!",
      },
    },

    price: {
      type: Number,
      required: [true, "Price is required!"],
      min: [0, "Price cannot be negative!"],
    },

    mainImage: {
      type: String,
      required: [true, "Main image is required!"],
      trim: true,
    },

    imageGallery: {
      type: [String],
      default: [],
      validate: {
        validator: function (value) {
          return value.length <= 9;
        },
        message: "Maximum 9 images allowed in gallery!",
      },
    },

    purchasingLink: {
      type: String,
      trim: true,
      default: 'https://wa.me/923001561562?text=Hello%20I%20want%20to%20contact%20you'
    },

    type: {
      type: String,
      enum: ["unstitched", "stitched"],
      default: "unstitched",
      required: true,
    },

    volume: {
      type: Schema.Types.ObjectId,
      ref: "Volume",
      required: [true, "Volume is required!"],
    },

    metaTitle: {
      type: String,
      required: [true, "Meta Title is required!"],
      maxlength: [80, "Meta Title must be less than 60 characters!"],
      trim: true,
    },

    metaDescription: {
      type: String,
      maxlength: [450, "Description must be less than 450 characters!"],
    },
  },
  {
    timestamps: true,
  },
);

const ProductModel = model("Product", ProductSchema);
module.exports = ProductModel;
