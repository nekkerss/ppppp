const mongoose = require("mongoose");

const ContractSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contractNumber: { type: String, unique: true, sparse: true, index: true },
    type: { type: String, required: true }, // auto, santé...
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["en attente", "actif", "expiré"], default: "en attente" },
    address: { type: String },
    age: { type: Number },
    contactNumber: { type: String },
    durationMonths: { type: Number }
});

const Contract = mongoose.model("Contract", ContractSchema);

module.exports = Contract;