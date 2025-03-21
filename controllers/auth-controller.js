const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  const isEmailExists = await User.findOne({
    $or: [{ username: username }, { email: email }],
  });
  if (isEmailExists) {
    return res
      .status(400)
      .json({ success: false, message: "Email or username already exists" });
  }

  // hash password
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUser = {
    username,
    email,
    password: hashedPassword,
    role: role || "user",
  };
  const user = await User.create(newUser);

  if (user) {
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  }
};
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // generate access token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" }
    );
    res.json({
      success: true,
      message: "Logged in successfully",
      accessToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again.",
    });
  }
};

const changePasswordController = async (req, res) => {
  try {
    // get user from request object
    const userId = req.userInfo.userId;

    // check if the user exists in the database
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // compare old password with the hashed one in the database
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide both old and new passwords",
      });
    }

    const isMatch = bcrypt.compareSync(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid old password" });
    }

    // hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashedNewPassword = bcrypt.hashSync(newPassword, salt);

    // update password in the database
    user.password = hashedNewPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log({ error });
    res.status(500).json({
      success: false,
      message: "Something went wrong! Please try again.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  changePasswordController,
};
