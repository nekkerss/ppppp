const Document = require("../models/Document");
const User = require("../models/User");
const Claim = require("../models/Claim");

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file?.path) {
      return res.status(400).json({ message: "Fichier manquant" });
    }

    let claimId = null;
    if (req.body.claimId) {
      const claim = await Claim.findById(req.body.claimId).select("_id userId");
      if (!claim) {
        return res.status(404).json({ message: "Sinistre introuvable" });
      }

      const currentUser = await User.findById(req.user.id).select("role");
      const canManage = ["admin", "gestionnaire"].includes(currentUser?.role);
      if (!canManage && claim.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Non autorisé pour ce sinistre" });
      }

      claimId = claim._id;
    }

    const doc = new Document({
      userId: req.user.id,
      claimId,
      fileUrl: req.file.path,
      type: req.body.type
    });

    await doc.save();
    const saved = await Document.findById(doc._id)
      .populate("userId", "name email role")
      .populate("claimId", "_id sinistreType date");
    return res.json(saved);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("role");
    const canSeeAll = ["admin", "gestionnaire"].includes(currentUser?.role);
    const query = canSeeAll ? {} : { userId: req.user.id };

    if (req.query.claimId) {
      query.claimId = req.query.claimId;
    }

    const docs = await Document.find(query)
      .populate("userId", "name email role")
      .populate("claimId", "_id sinistreType date")
      .sort({ createdAt: -1 });
    return res.json(docs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    
    if (!doc) {
      return res.status(404).json({ message: "Document non trouvé" });
    }

    const currentUser = await User.findById(req.user.id).select("role");
    const canDeleteAny = ["admin", "gestionnaire"].includes(currentUser?.role);

    if (!canDeleteAny && doc.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: "Document supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};