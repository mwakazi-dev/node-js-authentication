const express = require("express");
const {
  registerUser,
  loginUser,
  changePasswordController,
} = require("../controllers/auth-controller");
const authMiddleware = require("../middleware/auth-middleware");

const router = express.Router();

// all auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/change-password", authMiddleware, changePasswordController);

module.exports = router;
