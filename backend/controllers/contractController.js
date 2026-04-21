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

    // Renew for another year
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