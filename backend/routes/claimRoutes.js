const express = require("express");
const router = express.Router();
const { createClaim, getClaims, updateClaimStatus, deleteClaim, updateClaim } = require("../controllers/claimController");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const claimUpload = upload.fields([
  { name: "attestationTiers", maxCount: 1 },
  { name: "constat", maxCount: 1 },
  { name: "photoVehicule", maxCount: 1 }
]);

router.post("/", auth, (req, res, next) => {
  claimUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Erreur de téléversement de fichiers" });
    }
    return next();
  });
}, createClaim);
router.get("/", auth, getClaims);
router.patch("/:id/status", auth, updateClaimStatus);
router.patch("/:id", auth, (req, res, next) => {
  claimUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Erreur de téléversement de fichiers" });
    }
    return next();
  });
}, updateClaim);
router.delete("/:id", auth, deleteClaim);

module.exports = router;