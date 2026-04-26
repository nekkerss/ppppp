const Contract = require("../models/Contract");

const generateContractNumber = () => {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `CTR-${year}-${randomPart}`;
};

exports.createContract = async (req, res) => {
  try {
    const { address, age, contactNumber, durationMonths, type, startDate, endDate } = req.body;
    if (!address || !age || !contactNumber || !durationMonths || !type || !startDate || !endDate) {
      return res.status(400).json({ message: "Veuillez remplir tous les champs obligatoires" });
    }

    const payload = { ...req.body, userId: req.user.id, status: "en attente" };

    if (!payload.contractNumber) {
      payload.contractNumber = generateContractNumber();
    }

    const contract = new Contract(payload);
    await contract.save();
    return res.json(contract);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getContracts = async (req, res) => {
  const contracts = await Contract.find({ userId: req.user.id });
  res.json(contracts);
};

exports.renewContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: "Contrat non trouvé" });
    }

    if (contract.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const newEndDate = new Date(contract.endDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    contract.endDate = newEndDate;
    contract.status = "actif";
    await contract.save();

    res.json({ message: "Contrat renouvelé avec succès", contract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: "Contrat non trouvé" });
    }

    if (contract.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    contract.status = "expiré";
    await contract.save();

    res.json({ message: "Contrat annulé avec succès", contract });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: "Contrat non trouvé" });
    }

    if (contract.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const { address, age, contactNumber, durationMonths } = req.body;
    if (address !== undefined) contract.address = address;
    if (age !== undefined) contract.age = Number(age);
    if (contactNumber !== undefined) contract.contactNumber = contactNumber;
    if (durationMonths !== undefined) contract.durationMonths = Number(durationMonths);

    await contract.save();
    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: "Contrat non trouvé" });
    }

    if (contract.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    await Contract.findByIdAndDelete(req.params.id);
    res.json({ message: "Contrat supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllContractsGestionnaire = async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate("userId", "name email CIN phone")
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reviewContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: "Contrat non trouvé" });
    }

    const { action, rejectionReason } = req.body;

    if (action === "accept") {
      contract.status = "actif";
      contract.rejectionReason = undefined;
    } else if (action === "refuse") {
      contract.status = "refusé";
      contract.rejectionReason = rejectionReason || "";
    } else {
      return res.status(400).json({ message: "Action invalide. Utilisez 'accept' ou 'refuse'" });
    }

    await contract.save();
    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.payContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: "Contrat non trouvé" });
    }

    if (contract.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    if (contract.status !== "actif") {
      return res.status(400).json({ message: "Le contrat doit être actif pour être payé" });
    }

    const { paymentMethod } = req.body;
    if (!["online", "inperson"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Méthode de paiement invalide" });
    }

    contract.paymentStatus = "paid";
    contract.paymentMethod = paymentMethod;
    await contract.save();

    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
