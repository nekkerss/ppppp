const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!["admin", "gestionnaire"].includes(currentUser.role)) {
      return res.status(403).json({ message: "Admin or gestionnaire access required" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Admin check failed" });
  }
};
