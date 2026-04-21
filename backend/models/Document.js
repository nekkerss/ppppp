const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: "Claim", default: null },
    fileUrl: { type: String, required: true },
    type: { type: String }, // CIN, contrat, preuve...
    createdAt: { type: Date, default: Date.now }
});

const Document = mongoose.model("Document", DocumentSchema);

module.exports = Document;