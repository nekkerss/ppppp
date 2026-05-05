const PDFDocument = require("pdfkit");
const Contract = require("../models/Contract");
const Quote = require("../models/Quote");
const User = require("../models/User");

const BRAND_DARK = "#0f2744";
const BRAND_GREEN = "#00a67e";
const GRAY = "#64748b";
const LIGHT_GRAY = "#f1f5f9";
const TYPE_LABELS = {
  auto:       "Assurance Automobile",
  sante:      "Assurance Santé",
  habitation: "Assurance Habitation",
  voyage:     "Assurance Voyage",
  vie:        "Assurance Vie",
};
const PARAM_LABELS = {
  age: "Âge", marque: "Marque du véhicule", anneeVehicule: "Année du véhicule",
  ville: "Ville", valeurBien: "Valeur du bien (TND)", superficie: "Superficie (m²)",
  destination: "Destination", dureeSejour: "Durée du séjour (jours)",
  nombreVoyageurs: "Nombre de voyageurs", capitalSouhaite: "Capital souhaité (TND)",
  revenuMensuel: "Revenu mensuel (TND)", nombrePersonnes: "Nombre de personnes",
  typeLogement: "Type de logement",
};

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function drawHeader(doc, title) {
  // Dark top band
  doc.rect(0, 0, doc.page.width, 70).fill(BRAND_DARK);

  // Green accent bar
  doc.rect(0, 70, doc.page.width, 4).fill(BRAND_GREEN);

  // Company name
  doc.fillColor("white").font("Helvetica-Bold").fontSize(22)
     .text("BNA", 40, 20, { continued: true })
     .font("Helvetica").fontSize(14).fillColor(BRAND_GREEN)
     .text(" Assurances", { continued: false });

  doc.fillColor("#94a3b8").font("Helvetica").fontSize(8)
     .text("Banque Nationale Agricole — Filiale Assurances", 40, 44);

  // Document title on right
  doc.fillColor("white").font("Helvetica-Bold").fontSize(11)
     .text(title, 0, 26, { align: "right", width: doc.page.width - 40 });

  doc.fillColor(BRAND_DARK); // reset color
  doc.moveDown(3.5);
}

function drawFooter(doc) {
  const y = doc.page.height - 45;
  doc.rect(0, y - 8, doc.page.width, 1).fill(BRAND_GREEN);
  doc.rect(0, y - 7, doc.page.width, doc.page.height).fill(BRAND_DARK);
  doc.fillColor("#94a3b8").font("Helvetica").fontSize(7.5)
     .text(
       "BNA Assurances — Document généré automatiquement — www.bna-assurances.tn",
       40, y + 2, { align: "center", width: doc.page.width - 80 }
     );
}

function sectionTitle(doc, text) {
  doc.moveDown(0.4);
  doc.rect(40, doc.y, doc.page.width - 80, 22).fill(BRAND_DARK);
  doc.fillColor("white").font("Helvetica-Bold").fontSize(9)
     .text(text.toUpperCase(), 50, doc.y - 17);
  doc.fillColor(BRAND_DARK);
  doc.moveDown(0.8);
}

function row(doc, label, value, shade) {
  const rowY = doc.y;
  const rowH = 18;
  if (shade) {
    doc.rect(40, rowY, doc.page.width - 80, rowH).fill(LIGHT_GRAY);
  }
  doc.fillColor(GRAY).font("Helvetica").fontSize(8.5)
     .text(label, 50, rowY + 4, { width: 180 });
  doc.fillColor(BRAND_DARK).font("Helvetica-Bold").fontSize(8.5)
     .text(String(value || "—"), 240, rowY + 4, { width: doc.page.width - 280 });
  doc.moveDown(0.85);
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function statusLabel(s) {
  return { "en attente": "En attente", actif: "Actif", "expiré": "Expiré", "refusé": "Refusé" }[s] || s;
}

// ─── Contract PDF ─────────────────────────────────────────────────────────────
exports.contractPdf = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id).populate("userId", "name email");

    if (!contract) return res.status(404).json({ message: "Contrat introuvable" });

    const requester = await User.findById(req.user.id).select("role");
    const uid = req.user.id;
    if (requester?.role === "user" && contract.userId._id.toString() !== uid) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="contrat-${contract.contractNumber || contract._id}.pdf"`
    );
    doc.pipe(res);

    drawHeader(doc, "CONTRAT D'ASSURANCE");

    // Reference block
    doc.fillColor(BRAND_DARK).font("Helvetica-Bold").fontSize(13)
       .text(TYPE_LABELS[contract.type] || contract.type, 40, doc.y);
    doc.fillColor(BRAND_GREEN).font("Helvetica-Bold").fontSize(9)
       .text(`N° ${contract.contractNumber || "Non attribué"}`, 40, doc.y + 2);
    doc.moveDown(1.2);

    sectionTitle(doc, "Informations du client");
    row(doc, "Nom complet",     contract.userId?.name,  false);
    row(doc, "Email",           contract.userId?.email, true);
    row(doc, "Téléphone",       contract.contactNumber, false);
    row(doc, "Adresse",         contract.address,       true);
    row(doc, "Âge",             contract.age ? `${contract.age} ans` : "—", false);

    sectionTitle(doc, "Détails du contrat");
    row(doc, "Type d'assurance", TYPE_LABELS[contract.type] || contract.type, false);
    row(doc, "Date de début",    formatDate(contract.startDate),  true);
    row(doc, "Date de fin",      formatDate(contract.endDate),    false);
    row(doc, "Durée",            contract.durationMonths ? `${contract.durationMonths} mois` : "—", true);
    row(doc, "Statut",           statusLabel(contract.status),   false);
    row(doc, "Paiement",         contract.paymentStatus === "paid" ? "Payé" : "Non payé", true);
    row(doc, "Mode de paiement", contract.paymentMethod === "online" ? "En ligne" : contract.paymentMethod === "inperson" ? "En agence" : "—", false);
    row(doc, "Date de création", formatDate(contract.createdAt),  true);

    if (contract.rejectionReason) {
      sectionTitle(doc, "Motif de refus");
      doc.fillColor(BRAND_DARK).font("Helvetica").fontSize(9)
         .text(contract.rejectionReason, 50, doc.y, { width: doc.page.width - 100 });
      doc.moveDown(1);
    }

    // Signature zone
    doc.moveDown(1.5);
    const sigY = doc.y;
    doc.rect(40, sigY, 160, 55).stroke(BRAND_DARK);
    doc.rect(doc.page.width - 200, sigY, 160, 55).stroke(BRAND_DARK);
    doc.fillColor(GRAY).font("Helvetica").fontSize(8)
       .text("Signature du client", 40, sigY + 40, { width: 160, align: "center" })
       .text("Signature BNA Assurances", doc.page.width - 200, sigY + 40, { width: 160, align: "center" });

    drawFooter(doc);
    doc.end();
  } catch (err) {
    console.error("Contract PDF error:", err.message);
    res.status(500).json({ message: "Erreur génération PDF" });
  }
};

// ─── Quote PDF ────────────────────────────────────────────────────────────────
exports.quotePdf = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id).populate("userId", "name email");

    if (!quote) return res.status(404).json({ message: "Devis introuvable" });

    const requester = await User.findById(req.user.id).select("role");
    if (requester?.role === "user" && quote.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="devis-${quote._id}.pdf"`
    );
    doc.pipe(res);

    drawHeader(doc, "DEVIS D'ASSURANCE");

    doc.fillColor(BRAND_DARK).font("Helvetica-Bold").fontSize(13)
       .text(TYPE_LABELS[quote.type] || quote.type, 40, doc.y);
    doc.fillColor(GRAY).font("Helvetica").fontSize(9)
       .text(`Devis établi le ${formatDate(quote.createdAt)}`, 40, doc.y + 2);
    doc.moveDown(1.2);

    sectionTitle(doc, "Client");
    row(doc, "Nom complet", quote.userId?.name,  false);
    row(doc, "Email",       quote.userId?.email, true);

    sectionTitle(doc, "Paramètres de la souscription");
    const params = Object.entries(quote.parametres || {});
    params.forEach(([k, v], i) => {
      row(doc, PARAM_LABELS[k] || k, v, i % 2 === 1);
    });

    sectionTitle(doc, "Tarification IA");

    // Price box
    const priceBoxY = doc.y;
    doc.rect(40, priceBoxY, doc.page.width - 80, 38).fill(BRAND_DARK);
    doc.fillColor("#94a3b8").font("Helvetica").fontSize(8)
       .text("Prime annuelle estimée", 55, priceBoxY + 6);
    doc.fillColor(BRAND_GREEN).font("Helvetica-Bold").fontSize(20)
       .text(
         new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND", maximumFractionDigits: 0 }).format(quote.prix),
         55, priceBoxY + 16
       );
    doc.moveDown(2.8);

    if (quote.explication) {
      doc.rect(40, doc.y, doc.page.width - 80, 1).fill(BRAND_GREEN);
      doc.moveDown(0.5);
      doc.fillColor(GRAY).font("Helvetica-Oblique").fontSize(8.5)
         .text(quote.explication, 50, doc.y, { width: doc.page.width - 100 });
      doc.moveDown(1);
    }

    // Disclaimer
    doc.moveDown(0.5);
    doc.rect(40, doc.y, doc.page.width - 80, 1).fill(LIGHT_GRAY);
    doc.moveDown(0.5);
    doc.fillColor(GRAY).font("Helvetica").fontSize(7.5)
       .text(
         "Ce devis est fourni à titre indicatif et ne constitue pas un engagement contractuel. " +
         "Le tarif définitif sera établi après étude complète de votre dossier par un gestionnaire BNA Assurances.",
         50, doc.y, { width: doc.page.width - 100 }
       );

    drawFooter(doc);
    doc.end();
  } catch (err) {
    console.error("Quote PDF error:", err.message);
    res.status(500).json({ message: "Erreur génération PDF" });
  }
};
