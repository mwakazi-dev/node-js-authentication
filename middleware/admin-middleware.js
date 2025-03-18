const adminMiddleware = (req, res, next) => {
  if (req.userInfo.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Unauthorized. Only admin can access this route.",
    });
  }
  next();
};

module.exports = adminMiddleware;
