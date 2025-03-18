const express = require("express");
const welcomeHome = require("../controllers/home-controller");
const authMiddleware = require("../middleware/auth-middleware");

const router = express.Router();

router.get("/welcome", authMiddleware, welcomeHome);

module.exports = router;
