const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Accès refusé (pas de token)" });
    }

    // Remove "Bearer "
    const verifiedToken = token.split(" ")[1];

    const decoded = jwt.verify(verifiedToken, "SECRET_KEY");

    req.user = decoded; // { id: userId }

    next(); // continue to controller

  } catch (error) {
    res.status(401).json({ message: "Token invalide" });
  }
};