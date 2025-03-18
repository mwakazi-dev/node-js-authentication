const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized. Please login." });
  }
  // verify token
  try {
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decodedUser) {
      return res.status(403).json({
        success: false,
        message: "Invalid token. Please login again.",
      });
    }
    req.userInfo = decodedUser;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

module.exports = authMiddleware;
