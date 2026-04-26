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
      photoVehicule: req.files?.photoVehicule?.[0]?.path || null,
      cinPasseport: req.files?.cinPasseport?.[0]?.path || null,
      policeAssurance: req.files?.policeAssurance?.[0]?.path || null,
      billetsAvion: req.files?.billetsAvion?.[0]?.path || null,
      preuveReservation: req.files?.preuveReservation?.[0]?.path || null,
      feuilleSoins: req.files?.feuilleSoins?.[0]?.path || null,
      rapportMedical: req.files?.rapportMedical?.[0]?.path || null,
      facturesOriginales: req.files?.facturesOriginales?.[0]?.path || null,
      facturesPharmacie: req.files?.facturesPharmacie?.[0]?.path || null,
      resultatsAnalyses: req.files?.resultatsAnalyses?.[0]?.path || null,
      prescription: req.files?.prescription?.[0]?.path || null,
      bulletinHospitalisation: req.files?.bulletinHospitalisation?.[0]?.path || null,
      factureClinic: req.files?.factureClinic?.[0]?.path || null,
      compteRenduHospitalisation: req.files?.compteRenduHospitalisation?.[0]?.path || null,
      carteIdentiteBatiment: req.files?.carteIdentiteBatiment?.[0]?.path || null,
      contratAssuranceHabitation: req.files?.contratAssuranceHabitation?.[0]?.path || null,
      declarationEcriteBatiment: req.files?.declarationEcriteBatiment?.[0]?.path || null,
      photosDegats: req.files?.photosDegats?.[0]?.path || null,
      listeBiensDommages: req.files?.listeBiensDommages?.[0]?.path || null,
      constatAmiableEaux: req.files?.constatAmiableEaux?.[0]?.path || null,
      coordonneesImpliques: req.files?.coordonneesImpliques?.[0]?.path || null,
      rapportProtectionCivile: req.files?.rapportProtectionCivile?.[0]?.path || null,
      preuveIntervention: req.files?.preuveIntervention?.[0]?.path || null,
      rapportExpert: req.files?.rapportExpert?.[0]?.path || null,
      titrePropriete: req.files?.titrePropriete?.[0]?.path || null
    };

    const claim = new Claim({
      fullName: req.body.fullName,
      cinNumber: req.body.cinNumber,
      email: req.body.email,
      gsm: req.body.gsm,
      immatriculation: req.body.immatriculation || undefined,
      voyageSubType: req.body.voyageSubType || undefined,
      santeSubType: req.body.santeSubType || undefined,
      batimentSubType: req.body.batimentSubType || undefined,
      numeroPoliceBatiment: req.body.numeroPoliceBatiment || undefined,
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

    const { status, rejectionReason } = req.body;
    const allowedStatus = ["en attente", "accepté", "refusé"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const updateData = { status };
    if (status === "refusé") {
      updateData.rejectionReason = rejectionReason || "";
    } else {
      updateData.rejectionReason = null;
    }

    const updated = await Claim.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { returnDocument: "after" }
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
      "voyageSubType",
      "santeSubType",
      "batimentSubType",
      "numeroPoliceBatiment",
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
    const fileFields = [
      "attestationTiers", "constat", "photoVehicule",
      "cinPasseport", "policeAssurance", "billetsAvion", "preuveReservation",
      "feuilleSoins", "rapportMedical", "facturesOriginales",
      "facturesPharmacie", "resultatsAnalyses", "prescription",
      "bulletinHospitalisation", "factureClinic", "compteRenduHospitalisation",
      "carteIdentiteBatiment", "contratAssuranceHabitation", "declarationEcriteBatiment",
      "photosDegats", "listeBiensDommages", "constatAmiableEaux", "coordonneesImpliques",
      "rapportProtectionCivile", "preuveIntervention", "rapportExpert", "titrePropriete"
    ];
    fileFields.forEach((field) => {
      const newFile = req.files?.[field]?.[0]?.path;
      const oldFile = claim.files?.[field];
      if (newFile && oldFile) {
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
      photoVehicule: req.files?.photoVehicule?.[0]?.path || claim.files?.photoVehicule || null,
      cinPasseport: req.files?.cinPasseport?.[0]?.path || claim.files?.cinPasseport || null,
      policeAssurance: req.files?.policeAssurance?.[0]?.path || claim.files?.policeAssurance || null,
      billetsAvion: req.files?.billetsAvion?.[0]?.path || claim.files?.billetsAvion || null,
      preuveReservation: req.files?.preuveReservation?.[0]?.path || claim.files?.preuveReservation || null,
      feuilleSoins: req.files?.feuilleSoins?.[0]?.path || claim.files?.feuilleSoins || null,
      rapportMedical: req.files?.rapportMedical?.[0]?.path || claim.files?.rapportMedical || null,
      facturesOriginales: req.files?.facturesOriginales?.[0]?.path || claim.files?.facturesOriginales || null,
      facturesPharmacie: req.files?.facturesPharmacie?.[0]?.path || claim.files?.facturesPharmacie || null,
      resultatsAnalyses: req.files?.resultatsAnalyses?.[0]?.path || claim.files?.resultatsAnalyses || null,
      prescription: req.files?.prescription?.[0]?.path || claim.files?.prescription || null,
      bulletinHospitalisation: req.files?.bulletinHospitalisation?.[0]?.path || claim.files?.bulletinHospitalisation || null,
      factureClinic: req.files?.factureClinic?.[0]?.path || claim.files?.factureClinic || null,
      compteRenduHospitalisation: req.files?.compteRenduHospitalisation?.[0]?.path || claim.files?.compteRenduHospitalisation || null,
      carteIdentiteBatiment: req.files?.carteIdentiteBatiment?.[0]?.path || claim.files?.carteIdentiteBatiment || null,
      contratAssuranceHabitation: req.files?.contratAssuranceHabitation?.[0]?.path || claim.files?.contratAssuranceHabitation || null,
      declarationEcriteBatiment: req.files?.declarationEcriteBatiment?.[0]?.path || claim.files?.declarationEcriteBatiment || null,
      photosDegats: req.files?.photosDegats?.[0]?.path || claim.files?.photosDegats || null,
      listeBiensDommages: req.files?.listeBiensDommages?.[0]?.path || claim.files?.listeBiensDommages || null,
      constatAmiableEaux: req.files?.constatAmiableEaux?.[0]?.path || claim.files?.constatAmiableEaux || null,
      coordonneesImpliques: req.files?.coordonneesImpliques?.[0]?.path || claim.files?.coordonneesImpliques || null,
      rapportProtectionCivile: req.files?.rapportProtectionCivile?.[0]?.path || claim.files?.rapportProtectionCivile || null,
      preuveIntervention: req.files?.preuveIntervention?.[0]?.path || claim.files?.preuveIntervention || null,
      rapportExpert: req.files?.rapportExpert?.[0]?.path || claim.files?.rapportExpert || null,
      titrePropriete: req.files?.titrePropriete?.[0]?.path || claim.files?.titrePropriete || null
    };
    claim.files = nextFiles;

    await claim.save();

    const updated = await Claim.findById(claim._id).populate("userId", "name email role");
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};