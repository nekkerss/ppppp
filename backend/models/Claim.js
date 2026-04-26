const mongoose = require("mongoose");

const ClaimSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true },
    sinistreType: {
        type: String,
        enum: ["sante", "voyage", "auto", "batiment"],
        required: false
    },
    fullName: { type: String, required: false },
    cinNumber: { type: String, required: false },
    email: { type: String, required: false },
    gsm: { type: String, required: false },
    immatriculation: { type: String, required: false },
    voyageSubType: {
        type: String,
        enum: ["medical_etranger", "retard_annulation_vol", "perte_vol_bagages"],
        required: false
    },
    santeSubType: {
        type: String,
        enum: ["medicaments_examens", "hospitalisation"],
        required: false
    },
    batimentSubType: {
        type: String,
        enum: ["degats_eaux", "incendie", "gros_sinistre"],
        required: false
    },
    numeroPoliceBatiment: { type: String, required: false },
    description: { type: String, required: true },
    status: { type: String, enum: ["en attente", "accepté", "refusé"], default: "en attente" },
    rejectionReason: { type: String },
    files: {
        attestationTiers: { type: String, default: null },
        constat: { type: String, default: null },
        photoVehicule: { type: String, default: null },
        cinPasseport: { type: String, default: null },
        policeAssurance: { type: String, default: null },
        billetsAvion: { type: String, default: null },
        preuveReservation: { type: String, default: null },
        feuilleSoins: { type: String, default: null },
        rapportMedical: { type: String, default: null },
        facturesOriginales: { type: String, default: null },
        facturesPharmacie: { type: String, default: null },
        resultatsAnalyses: { type: String, default: null },
        prescription: { type: String, default: null },
        bulletinHospitalisation: { type: String, default: null },
        factureClinic: { type: String, default: null },
        compteRenduHospitalisation: { type: String, default: null },
        carteIdentiteBatiment: { type: String, default: null },
        contratAssuranceHabitation: { type: String, default: null },
        declarationEcriteBatiment: { type: String, default: null },
        photosDegats: { type: String, default: null },
        listeBiensDommages: { type: String, default: null },
        constatAmiableEaux: { type: String, default: null },
        coordonneesImpliques: { type: String, default: null },
        rapportProtectionCivile: { type: String, default: null },
        preuveIntervention: { type: String, default: null },
        rapportExpert: { type: String, default: null },
        titrePropriete: { type: String, default: null }
    },
    date: { type: Date, default: Date.now }
});

const Claim = mongoose.model("Claim", ClaimSchema);

module.exports = Claim;