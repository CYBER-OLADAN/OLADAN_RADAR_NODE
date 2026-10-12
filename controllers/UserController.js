const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Auto-detect role from email if not provided
    const detectRoleFromEmail = (email) => {
      if (!email) return "tenant";
      const domain = email.split("@")[1]?.toLowerCase() || "";
      if (domain.includes("landlord")) return "landlord";
      if (domain.includes("tenant")) return "tenant";
      return "tenant";
    };
    const userRole = role || detectRoleFromEmail(email);

    const user = new User({ firstName, lastName, email, password, role: userRole });
    await user.save();
    const token = jwt.sign({ id: user._id, role: userRole }, process.env.JWT_SECRET);
    res.status(201).json({ token, user: { id: user._id, firstName, lastName, email: user.email, role: userRole } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Note: we compare raw passwords here for simplicity.
    // In production, use bcrypt.compare() for hashed passwords.
    const isMatch = password === user.password;
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};