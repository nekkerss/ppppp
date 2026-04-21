const mongoose = require("mongoose");

const QuoteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    prix: { type: Number, required: true },
    parametres: { type: Object }, // âge, voiture, etc.
    createdAt: { type: Date, default: Date.now }
});

const Quote = mongoose.model("Quote", QuoteSchema);

module.exports = Quote;