const User = require("../models/User");

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const disallowedFields = ["role", "emailVerified", "verificationCode", "verificationCodeExpires", "resetPasswordToken", "resetPasswordExpires", "password"];
    const safeBody = { ...req.body };
    disallowedFields.forEach((field) => delete safeBody[field]);

    const user = await User.findByIdAndUpdate(req.user.id, safeBody, { new: true }).select("-password");
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Admin - list all accounts
exports.getAllAccounts = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Admin - get one account details
exports.getAccountById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Admin - update account (role/verification/basic info)
exports.updateAccountByAdmin = async (req, res) => {
  try {
    const allowedUpdates = ["name", "email", "phone", "CIN", "role", "emailVerified"];
    const payload = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        payload[field] = req.body[field];
      }
    });

    if (payload.role && !["user", "admin", "gestionnaire"].includes(payload.role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    if (req.params.id === req.user.id && payload.role && payload.role !== req.user.role) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }

    const updated = await User.findByIdAndUpdate(req.params.id, payload, { new: true }).select("-password");
    if (!updated) {
      return res.status(404).json({ message: "Account not found" });
    }
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Admin - delete account
exports.deleteAccountByAdmin = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Admin cannot delete own account" });
    }

    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Account not found" });
    }
    return res.json({ message: "Account deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Message recipients helper
exports.getMessageRecipients = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("role");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isStaff = ["admin", "gestionnaire"].includes(currentUser.role);
    const query = isStaff
      ? { _id: { $ne: req.user.id } }
      : { role: { $in: ["admin", "gestionnaire"] } };

    const users = await User.find(query).select("name email role");
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};