const fs = require("fs");
const path = require("path");
const Claim = require("../models/Claim");
const Contract = require("../models/Contract");
const User = require("../models/User");

exports.createClaim = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("role");
    if (currentUser?.role === "gestionnaire") {
      return res.status(403).json({ message: "Le gestionnaire ne peut pas créer de déclaration." });
    }

    // Extract files if they exist
    const files = {
      attestationTiers: req.files?.attestationTiers?.[0]?.path || null,
      constat: req.files?.constat?.[0]?.path || null,
      photoVehicule: req.files?.photoVehicule?.[0]?.path || null
    };

    const claim = new Claim({
      fullName: req.body.fullName,
      cinNumber: req.body.cinNumber,
      email: req.body.email,
      gsm: req.body.gsm,
      immatriculation: req.body.immatriculation || undefined,
      contractId: req.body.contractId,
      description: req.body.description,
      date: req.body.date || new Date(),
      sinistreType: req.body.sinistreType,
      files: files,
      userId: req.user.id
    });

    await claim.save();

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClaims = async (req, res) => {
  const currentUser = await User.findById(req.user.id).select("role");
  const canSeeAll = ["admin", "gestionnaire"].includes(currentUser?.role);
  const query = canSeeAll ? {} : { userId: req.user.id };
  const claims = await Claim.find(query).populate("userId", "name email role");
  res.json(claims);
};

exports.updateClaimStatus = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("role");
    if (!["admin", "gestionnaire"].includes(currentUser?.role)) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    const { status } = req.body;
    const allowedStatus = ["en attente", "accepté", "refusé"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const updated = await Claim.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email role");

    if (!updated) {
      return res.status(404).json({ message: "Déclaration non trouvée" });
    }
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteClaim = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("role");
    const canManage = ["admin", "gestionnaire"].includes(currentUser?.role);

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: "Déclaration non trouvée" });
    }

    const claimUserIdStr = claim.userId._id ? claim.userId._id.toString() : claim.userId.toString();
    const reqUserIdStr = req.user.id ? req.user.id.toString() : (req.user._id ? req.user._id.toString() : "");

    if (!canManage && claimUserIdStr !== reqUserIdStr) {
      console.log("Access denied. claimUserIdStr:", claimUserIdStr, "reqUserIdStr:", reqUserIdStr);
      return res.status(403).json({ message: "Accès interdit" });
    }

    await Claim.findByIdAndDelete(req.params.id);
    return res.json({ message: "Déclaration supprimée avec succès" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateClaim = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("role");
    const canManage = ["admin", "gestionnaire"].includes(currentUser?.role);

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ message: "Déclaration non trouvée" });
    }

    const claimUserIdStr = claim.userId._id ? claim.userId._id.toString() : claim.userId.toString();
    const reqUserIdStr = req.user.id ? req.user.id.toString() : (req.user._id ? req.user._id.toString() : "");

    if (!canManage && claimUserIdStr !== reqUserIdStr) {
      console.log("Access denied in updateClaim. claimUserId:", claimUserIdStr, "reqUserId:", reqUserIdStr);
      return res.status(403).json({ message: "Accès interdit" });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "sinistreType")) {
      const allowedTypes = ["sante", "voyage", "auto", "batiment"];
      if (req.body.sinistreType && !allowedTypes.includes(req.body.sinistreType)) {
        return res.status(400).json({ message: "Type de sinistre invalide" });
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "contractId")) {
      if (!req.body.contractId) {
        return res.status(400).json({ message: "Contrat invalide" });
      }
      if (!canManage) {
        const contract = await Contract.findById(req.body.contractId).select("userId");
        if (!contract) {
          return res.status(404).json({ message: "Contrat non trouvé" });
        }
        if (contract.userId.toString() !== req.user.id.toString()) {
          return res.status(403).json({ message: "Non autorisé pour ce contrat" });
        }
      }
    }

    const allowedBodyFields = [
      "fullName",
      "cinNumber",
      "email",
      "sinistreType",
      "contractId",
      "description",
      "date",
      "gsm",
      "immatriculation"
    ];
    allowedBodyFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        claim[field] = req.body[field];
      }
    });

    // Delete old files from disk when replaced by new uploads
    const fileFields = ["attestationTiers", "constat", "photoVehicule"];
    fileFields.forEach((field) => {
      const newFile = req.files?.[field]?.[0]?.path;
      const oldFile = claim.files?.[field];
      if (newFile && oldFile) {
        // Resolve absolute path — oldFile could be absolute or relative
        const oldPath = path.isAbsolute(oldFile)
          ? oldFile
          : path.join(__dirname, "..", oldFile);
        fs.unlink(oldPath, (err) => {
          if (err && err.code !== "ENOENT") console.error("Failed to delete old file:", err);
        });
      }
    });

    const nextFiles = {
      attestationTiers: req.files?.attestationTiers?.[0]?.path || claim.files?.attestationTiers || null,
      constat: req.files?.constat?.[0]?.path || claim.files?.constat || null,
      photoVehicule: req.files?.photoVehicule?.[0]?.path || claim.files?.photoVehicule || null
    };
    claim.files = nextFiles;

    await claim.save();

    const updated = await Claim.findById(claim._id).populate("userId", "name email role");
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};