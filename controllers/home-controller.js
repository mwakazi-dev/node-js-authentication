const welcomeHome = (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the API!",
    user: req.userInfo,
  });
};

module.exports = welcomeHome;
