const express = require("express");
const router = express.Router();
const { createClaim, getClaims, updateClaimStatus, deleteClaim, updateClaim } = require("../controllers/claimController");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const claimUpload = upload.fields([
  { name: "attestationTiers", maxCount: 1 },
  { name: "constat", maxCount: 1 },
  { name: "photoVehicule", maxCount: 1 },
  { name: "cinPasseport", maxCount: 1 },
  { name: "policeAssurance", maxCount: 1 },
  { name: "billetsAvion", maxCount: 1 },
  { name: "preuveReservation", maxCount: 1 },
  { name: "feuilleSoins", maxCount: 1 },
  { name: "rapportMedical", maxCount: 1 },
  { name: "facturesOriginales", maxCount: 1 },
  { name: "facturesPharmacie", maxCount: 1 },
  { name: "resultatsAnalyses", maxCount: 1 },
  { name: "prescription", maxCount: 1 },
  { name: "bulletinHospitalisation", maxCount: 1 },
  { name: "factureClinic", maxCount: 1 },
  { name: "compteRenduHospitalisation", maxCount: 1 },
  { name: "carteIdentiteBatiment", maxCount: 1 },
  { name: "contratAssuranceHabitation", maxCount: 1 },
  { name: "declarationEcriteBatiment", maxCount: 1 },
  { name: "photosDegats", maxCount: 1 },
  { name: "listeBiensDommages", maxCount: 1 },
  { name: "constatAmiableEaux", maxCount: 1 },
  { name: "coordonneesImpliques", maxCount: 1 },
  { name: "rapportProtectionCivile", maxCount: 1 },
  { name: "preuveIntervention", maxCount: 1 },
  { name: "rapportExpert", maxCount: 1 },
  { name: "titrePropriete", maxCount: 1 }
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