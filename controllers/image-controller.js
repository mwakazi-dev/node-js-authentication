const Image = require("../models/Image");
const { uploadToCloudinary } = require("../helpers/cloudinaryHelper");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const uploadImageController = async (req, res) => {
  try {
    // return error when there is no uploaded file
    if (!req.file) {
      return res.status(400).json({ success: false, message: "File missing" });
    }

    // upload image to cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file.path);

    // create new image record in the database
    const newImage = new Image({
      url,
      publicId,
      uploadedBy: req.userInfo.userId,
    });
    await newImage.save();

    // delete the temporary uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: "Image uploaded successfully",
      image: newImage,
    });
  } catch (error) {
    console.log("Error uploading image:", error);
    res.status(500).json({ success: false, message: "Error uploading image" });
  }
};

const getAllImagesController = async (req, res) => {
  try {
    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    // sort by
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // get total count of images
    const totalImages = await Image.countDocuments({});
    const totalPages = Math.ceil(totalImages / limit);

    const sortObj = {};
    sortObj[sortBy] = sortOrder;
    const images = await Image.find({}).sort(sortObj).skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages,
      totalImages,
      message: "Images fetched successfully",
      data: images,
    });
  } catch (error) {
    console.log("Error fetching images:", error);
    res.status(500).json({ success: false, message: "Error fetching images" });
  }
};

const deleteImageController = async (req, res) => {
  try {
    // get image id and user id from the request
    const { id } = req.params;
    const { userId } = req.userInfo;

    // get the image from the database
    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found.",
      });
    }

    // check if the user who uploaded the image is the same as the current logged-in user
    if (String(image.uploadedBy) !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this image.",
      });
    }

    // delete the image from cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // delete the image record from the database
    await Image.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.log("Error deleting image:", error);
    res.status(500).json({ success: false, message: "Error deleting image" });
  }
};

module.exports = {
  uploadImageController,
  getAllImagesController,
  deleteImageController,
};
