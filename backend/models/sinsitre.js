const mongoose = require("mongoose");

const SinistreSchema = new mongoose.Schema({
  CIN: { type: String, default: null },
  Immatriculation: { type: String, default: null },
  contractnumero: { type: String,default: null},
  Copieduconstat: { type: String, default: null },
  picduveicule: { type: String, default: null },
  attestationn: { type: String, default: null },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", }, 
});

module.exports = mongoose.model("Sinistre", SinistreSchema);
