const express = require("express");
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");
const uploadMiddleware = require("../middleware/upload-middleware");
const {
  uploadImageController,
  getAllImagesController,
  deleteImageController,
} = require("../controllers/image-controller");

const router = express.Router();

// all user routes
router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.single("image"),
  uploadImageController
);

router.get("/get", authMiddleware, getAllImagesController);

// delete image route
router.delete("/:id", authMiddleware, adminMiddleware, deleteImageController);

module.exports = router;
