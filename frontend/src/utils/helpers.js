// Date formatting
export const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

export const formatDateTime = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// Currency formatting
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "TND"
  }).format(amount);
};

// Status badge colors
export const getStatusBadgeColor = (status) => {
  const colors = {
    "actif": "bg-green-100 text-green-800",
    "expiré": "bg-red-100 text-red-800",
    "en attente": "bg-yellow-100 text-yellow-800",
    "accepté": "bg-green-100 text-green-800",
    "refusé": "bg-red-100 text-red-800"
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// Get days until expiry
export const daysUntilExpiry = (endDate) => {
  const today = new Date();
  const expiry = new Date(endDate);
  const diff = expiry - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Check if contract expires soon (< 30 days)
export const expiresSoon = (endDate) => {
  return daysUntilExpiry(endDate) < 30 && daysUntilExpiry(endDate) > 0;
};

// Get contract status with logic
export const getContractStatus = (status, endDate) => {
  if (status === "en attente") return "En attente";
  if (status === "refusé") return "Refusé";
  if (status === "expiré") return "Expiré";
  if (expiresSoon(endDate)) return "Expire bientôt";
  return "Actif";
};

// Truncate text
export const truncateText = (text, length = 50) => {
  return text && text.length > length ? text.substring(0, length) + "..." : text;
};

export const getSinistreTypeLabel = (type) => {
  const labels = {
    sante: "Santé",
    voyage: "Voyage",
    auto: "Auto",
    batiment: "Bâtiment"
  };
  return labels[type] || null;
};

export const getBatimentSubTypeLabel = (subType) => {
  const labels = {
    degats_eaux: "Dégâts des eaux",
    incendie: "Incendie",
    gros_sinistre: "Gros sinistre"
  };
  return labels[subType] || null;
};

export const getSanteSubTypeLabel = (subType) => {
  const labels = {
    medicaments_examens: "Médicaments / Examens",
    hospitalisation: "Hospitalisation"
  };
  return labels[subType] || null;
};

export const getVoyageSubTypeLabel = (subType) => {
  const labels = {
    medical_etranger: "Médical à l'étranger",
    retard_annulation_vol: "Retard ou annulation de vol",
    perte_vol_bagages: "Perte ou vol de bagages"
  };
  return labels[subType] || null;
};

// Generate activity feed description
export const getActivityDescription = (type, data) => {
  const descriptions = {
    claim_submitted: `Réclamation soumise - ${data?.description}`,
    document_uploaded: `Document chargé - ${data?.type}`,
    contract_renewed: `Contrat renouvelé - ${data?.type}`,
    contract_expired: `Contrat expiré - ${data?.type}`,
    quote_requested: `Devis demandé - ${data?.type}`,
    claim_approved: `Réclamation approuvée`,
    claim_rejected: `Réclamation rejetée`
  };
  return descriptions[type] || "Activité";
};
