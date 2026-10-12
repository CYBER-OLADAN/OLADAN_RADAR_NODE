const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendMail } = require("../config/mailer");
const { welcomeEmail, verifyEmail, forgotPasswordEmail } = require("../utils/emailTemplates");

function validatePasswordStrength(password) {
  const errors = [];
  if (typeof password !== "string" || password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password || "")) errors.push("At least 1 uppercase letter");
  if (!/[a-z]/.test(password || "")) errors.push("At least 1 lowercase letter");
  if (!/[0-9]/.test(password || "")) errors.push("At least 1 number");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password || "")) errors.push("At least 1 special character");
  return errors;
}

// Helper: detect role from email domain
const detectRoleFromEmail = (email) => {
  if (!email) return "tenant";
  const domain = email.split("@")[1]?.toLowerCase() || "";
  if (domain.includes("landlord")) return "landlord";
  if (domain.includes("tenant")) return "tenant";
  return "tenant";
};

exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const pwdErrors = validatePasswordStrength(password);
    if (pwdErrors.length > 0) {
      return res.status(400).json({ message: `Password is not strong enough: ${pwdErrors.join(", ")}` });
    }
    const userRole = role || detectRoleFromEmail(email);
    const user = new User({ firstName, lastName, email, password, role: userRole });
    await user.save();

    // Fire welcome + verification emails in the background
    try {
      const verifyToken = crypto.randomBytes(32).toString("hex");
      user.verifyToken = verifyToken;
      user.verifyTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
      const welcome = welcomeEmail({ firstName: user.firstName });
      const verify = verifyEmail({ firstName: user.firstName, verifyUrl });

      Promise.all([
        sendMail({ to: user.email, subject: welcome.subject, html: welcome.html, text: welcome.text }),
        sendMail({ to: user.email, subject: verify.subject, html: verify.html, text: verify.text }),
      ]).catch((mailErr) => {
        console.error("Failed to send welcome/verify email:", mailErr.message);
      });
    } catch (mailErr) {
      console.error("Failed to prepare welcome email:", mailErr.message);
    }

    const token = jwt.sign({ id: user._id, role: userRole }, process.env.JWT_SECRET);
    res.status(201).json({
      token,
      user: { id: user._id, firstName, lastName, email, role: userRole },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
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

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { firstName, lastName, email, password } = req.body;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (password) {
      const pwdErrors = validatePasswordStrength(password);
      if (pwdErrors.length > 0) {
        return res.status(400).json({ message: `Password is not strong enough: ${pwdErrors.join(", ")}` });
      }
      if (password.length < 6) return res.status(400).json({ message: "Password too short" });
      user.password = password;
    }

    await user.save();
    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const genericMessage = "If that email exists, we sent a reset link";
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: genericMessage });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    try {
      const tpl = forgotPasswordEmail({ firstName: user.firstName, resetUrl });
      await sendMail({ to: user.email, subject: tpl.subject, html: tpl.html, text: tpl.text });
    } catch (mailErr) {
      console.error("Failed to send reset email:", mailErr.message);
    }

    return res.status(200).json({ message: genericMessage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    const pwdErrors = validatePasswordStrength(newPassword);
    if (pwdErrors.length > 0) {
      return res.status(400).json({
        message: `Password is not strong enough: ${pwdErrors.join(", ")}`,
      });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    }).select("+resetToken +resetTokenExpires");

    if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Token is required" });

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpires: { $gt: new Date() },
    }).select("+verifyToken +verifyTokenExpires");

    if (!user) return res.status(400).json({ message: "Invalid or expired verification token" });

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Email verified" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};