import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatDate, getSinistreTypeLabel } from "../utils/helpers";
import { AuthContext } from "../context/AuthContext";
import { Building2, Car, HeartPulse, Plane, ClipboardList, ArrowRight } from "lucide-react";

const SINISTRE_TYPES = [
  {
    id: "sante",
    label: "Santé",
    description: "Frais médicaux, hospitalisation, soins",
    icon: HeartPulse,
    accent: "from-rose-500/15 to-rose-600/5 border-rose-500/30",
    iconClass: "text-rose-600 bg-rose-100"
  },
  {
    id: "voyage",
    label: "Voyage",
    description: "Bagages, annulation, assistance à l'étranger",
    icon: Plane,
    accent: "from-sky-500/15 to-sky-600/5 border-sky-500/30",
    iconClass: "text-sky-600 bg-sky-100"
  },
  {
    id: "auto",
    label: "Auto",
    description: "Accident, bris de glace, vol du véhicule",
    icon: Car,
    accent: "from-amber-500/15 to-amber-600/5 border-amber-500/30",
    iconClass: "text-amber-600 bg-amber-100"
  },
  {
    id: "batiment",
    label: "Bâtiment",
    description: "Incendie, dégâts des eaux, catastrophes",
    icon: Building2,
    accent: "from-emerald-500/15 to-emerald-600/5 border-emerald-500/30",
    iconClass: "text-emerald-600 bg-emerald-100"
  }
];

export default function SinistreDeclaration() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isGestionnaire = user?.role === "gestionnaire";
  const [contracts, setContracts] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [voyageSubType, setVoyageSubType] = useState("");
  const [santeSubType, setSanteSubType] = useState("");
  const [batimentSubType, setBatimentSubType] = useState("");
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    cinNumber: user?.CIN || "",
    email: user?.email || "",
    gsm: user?.phone || "",
    immatriculation: "",
    numeroPoliceBatiment: "",
    contractId: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    files: {
      attestationTiers: null,
      constat: null,
      photoVehicule: null,
      cinPasseport: null,
      policeAssurance: null,
      billetsAvion: null,
      preuveReservation: null,
      feuilleSoins: null,
      rapportMedical: null,
      facturesOriginales: null,
      facturesPharmacie: null,
      resultatsAnalyses: null,
      prescription: null,
      bulletinHospitalisation: null,
      factureClinic: null,
      compteRenduHospitalisation: null,
      carteIdentiteBatiment: null,
      contratAssuranceHabitation: null,
      declarationEcriteBatiment: null,
      photosDegats: null,
      listeBiensDommages: null,
      constatAmiableEaux: null,
      coordonneesImpliques: null,
      rapportProtectionCivile: null,
      preuveIntervention: null,
      rapportExpert: null,
      titrePropriete: null
    }
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [contractsRes, claimsRes] = await Promise.all([
          API.get("/contracts"),
          API.get("/claims")
        ]);
        setContracts(contractsRes.data || []);
        setClaims(claimsRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType) {
      alert("Veuillez choisir un type de sinistre.");
      return;
    }
    if (!formData.contractId || !formData.description.trim()) {
      alert("Veuillez remplir le contrat et la description.");
      return;
    }
    if (selectedType === "auto" && !formData.immatriculation.trim()) {
      alert("Veuillez remplir l'immatriculation du véhicule.");
      return;
    }
    if (selectedType === "auto" && !formData.files.constat) {
      alert("Veuillez joindre une copie du constat.");
      return;
    }
    if (selectedType === "voyage" && !voyageSubType) {
      alert("Veuillez choisir un type de sinistre voyage.");
      return;
    }
    if (selectedType === "sante" && !santeSubType) {
      alert("Veuillez choisir un type de sinistre santé.");
      return;
    }
    if (selectedType === "batiment" && !batimentSubType) {
      alert("Veuillez choisir un type de sinistre bâtiment.");
      return;
    }
    
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("cinNumber", formData.cinNumber);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("gsm", formData.gsm);
      if (formData.immatriculation) {
        formDataToSend.append("immatriculation", formData.immatriculation);
      }
      if (selectedType === "voyage" && voyageSubType) {
        formDataToSend.append("voyageSubType", voyageSubType);
      }
      if (selectedType === "sante" && santeSubType) {
        formDataToSend.append("santeSubType", santeSubType);
      }
      if (selectedType === "batiment") {
        if (batimentSubType) formDataToSend.append("batimentSubType", batimentSubType);
        if (formData.numeroPoliceBatiment) formDataToSend.append("numeroPoliceBatiment", formData.numeroPoliceBatiment);
      }
      formDataToSend.append("contractId", formData.contractId);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("sinistreType", selectedType);

      if (formData.files.attestationTiers) {
        formDataToSend.append("attestationTiers", formData.files.attestationTiers);
      }
      if (formData.files.constat) {
        formDataToSend.append("constat", formData.files.constat);
      }
      if (formData.files.photoVehicule) {
        formDataToSend.append("photoVehicule", formData.files.photoVehicule);
      }
      if (formData.files.cinPasseport) {
        formDataToSend.append("cinPasseport", formData.files.cinPasseport);
      }
      if (formData.files.policeAssurance) {
        formDataToSend.append("policeAssurance", formData.files.policeAssurance);
      }
      if (formData.files.billetsAvion) {
        formDataToSend.append("billetsAvion", formData.files.billetsAvion);
      }
      if (formData.files.preuveReservation) {
        formDataToSend.append("preuveReservation", formData.files.preuveReservation);
      }
      if (formData.files.feuilleSoins) {
        formDataToSend.append("feuilleSoins", formData.files.feuilleSoins);
      }
      if (formData.files.rapportMedical) {
        formDataToSend.append("rapportMedical", formData.files.rapportMedical);
      }
      if (formData.files.facturesOriginales) {
        formDataToSend.append("facturesOriginales", formData.files.facturesOriginales);
      }
      if (formData.files.facturesPharmacie) {
        formDataToSend.append("facturesPharmacie", formData.files.facturesPharmacie);
      }
      if (formData.files.resultatsAnalyses) {
        formDataToSend.append("resultatsAnalyses", formData.files.resultatsAnalyses);
      }
      if (formData.files.prescription) {
        formDataToSend.append("prescription", formData.files.prescription);
      }
      if (formData.files.bulletinHospitalisation) {
        formDataToSend.append("bulletinHospitalisation", formData.files.bulletinHospitalisation);
      }
      if (formData.files.factureClinic) {
        formDataToSend.append("factureClinic", formData.files.factureClinic);
      }
      if (formData.files.compteRenduHospitalisation) {
        formDataToSend.append("compteRenduHospitalisation", formData.files.compteRenduHospitalisation);
      }
      const BATIMENT_KEYS = [
        "carteIdentiteBatiment","contratAssuranceHabitation","declarationEcriteBatiment",
        "photosDegats","listeBiensDommages","constatAmiableEaux","coordonneesImpliques",
        "rapportProtectionCivile","preuveIntervention","rapportExpert","titrePropriete"
      ];
      BATIMENT_KEYS.forEach((k) => {
        if (formData.files[k]) formDataToSend.append(k, formData.files[k]);
      });
      
      const res = await API.post("/claims", formDataToSend);
      const createdClaim = res.data;
      if (createdClaim?._id) {
        setClaims((prev) => [createdClaim, ...prev]);
      }
      alert("Déclaration enregistrée avec succès.");
      navigate("/mon-sinistre");
      setFormData({
        fullName: user?.name || "",
        cinNumber: user?.CIN || "",
        email: user?.email || "",
        gsm: user?.phone || "",
        immatriculation: "",
        contractId: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        files: {
          attestationTiers: null,
          constat: null,
          photoVehicule: null,
          cinPasseport: null,
          policeAssurance: null,
          billetsAvion: null,
          preuveReservation: null
        }
      });
      setVoyageSubType("");
      setSanteSubType("");
      setBatimentSubType("");
      setSelectedType(null);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi de la déclaration.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh] p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a67e]" />
            <p className="mt-4 text-slate-600">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[#00a67e] text-sm font-semibold mb-2">
              <ClipboardList className="w-4 h-4" />
              Déclaration en ligne
            </div>
            <h1 className="text-3xl font-bold text-[#1a365d]">Déclaration de sinistre</h1>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Sélectionnez le type de sinistre (santé, voyage, auto ou bâtiment), puis renseignez les informations
              pour transmettre votre déclaration à BNA Assurances.
            </p>
          </div>
          <Link
            to="/mon-sinistre"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#00a67e] hover:text-[#008c6a]"
          >
            Voir mon sinistre
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!isGestionnaire && (
          <section>
            <h2 className="text-lg font-semibold text-[#1a365d] mb-4">Type de sinistre</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {SINISTRE_TYPES.map((t) => {
                const Icon = t.icon;
                const active = selectedType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedType(t.id)}
                    className={`
                      text-left rounded-2xl border-2 p-5 transition-all bg-gradient-to-br shadow-sm
                      ${t.accent}
                      ${active
                        ? "ring-2 ring-[#00a67e] border-[#00a67e] shadow-md scale-[1.02]"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                      }
                    `}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${t.iconClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-[#1a365d]">{t.label}</p>
                    <p className="text-sm text-slate-600 mt-1">{t.description}</p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {isGestionnaire && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
            Le gestionnaire ne peut pas déclarer de sinistre. Vous pouvez consulter, modifier le statut et gérer les dossiers utilisateurs depuis <strong>Mon sinistre</strong>.
          </div>
        )}

        {!isGestionnaire && selectedType && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 max-w-4xl">
            <h2 className="text-lg font-semibold text-[#1a365d] mb-1">Détails de la déclaration</h2>
            <p className="text-sm text-slate-500 mb-6">
              Type sélectionné :{" "}
              <span className="font-semibold text-[#00a67e]">{getSinistreTypeLabel(selectedType)}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Full Name & CIN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Votre Nom & Prénom ou raison sociale (lecture seule)</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-100 text-slate-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Numéro de pièce d'identité (CIN, Matricule Fiscal...) (lecture seule)</label>
                  <input
                    type="text"
                    value={formData.cinNumber}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-100 text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Row 2: Email & GSM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Email (lecture seule)</label>
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-100 text-slate-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">GSM *</label>
                  <input
                    type="tel"
                    required
                    value={formData.gsm}
                    onChange={(e) => setFormData({ ...formData, gsm: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                  />
                </div>
              </div>

              {/* Auto-specific fields */}
              {selectedType === "auto" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Immatriculation du véhicule * (ex: 123 TN 4567)</label>
                      <input
                        type="text"
                        required
                        placeholder="123 TN 4567"
                        value={formData.immatriculation}
                        onChange={(e) => setFormData({ ...formData, immatriculation: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Numéro de contrat *</label>
                      <select
                        required
                        value={formData.contractId}
                        onChange={(e) => setFormData({ ...formData, contractId: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                      >
                        <option value="">— Choisir un contrat —</option>
                        {contracts
                          .filter((c) => c.status === "actif")
                          .map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.type} — {c.contractNumber || `CTR-${String(c._id).slice(-6).toUpperCase()}`}
                            </option>
                          ))}
                      </select>
                      {contracts.filter((c) => c.status === "actif").length === 0 && (
                        <p className="text-sm text-amber-700 mt-2">
                          Aucun contrat actif.{" "}
                          <Link to="/contracts" className="underline font-medium">
                            Consultez vos contrats
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Non-auto: Contract selector */}
              {selectedType !== "auto" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Contrat concerné *</label>
                  <select
                    required
                    value={formData.contractId}
                    onChange={(e) => setFormData({ ...formData, contractId: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                  >
                    <option value="">— Choisir un contrat —</option>
                    {contracts
                      .filter((c) => c.status === "actif")
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.type} — {c.contractNumber || `CTR-${String(c._id).slice(-6).toUpperCase()}`}
                        </option>
                      ))}
                  </select>
                  {contracts.filter((c) => c.status === "actif").length === 0 && (
                    <p className="text-sm text-amber-700 mt-2">
                      Aucun contrat actif.{" "}
                      <Link to="/contracts" className="underline font-medium">
                        Consultez vos contrats
                      </Link>
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Date du sinistre</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Description *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Décrivez les circonstances, les dommages et toute information utile pour traiter votre dossier..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                />
              </div>

              {/* Voyage-specific fields */}
              {selectedType === "voyage" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Type de sinistre voyage *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "medical_etranger", label: "Médical à l'étranger" },
                        { id: "retard_annulation_vol", label: "Retard ou annulation de vol" },
                        { id: "perte_vol_bagages", label: "Perte ou vol de bagages" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setVoyageSubType(opt.id)}
                          className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            voyageSubType === opt.id
                              ? "border-[#00a67e] bg-sky-50 text-[#00a67e]"
                              : "border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Copie CIN ou passeport *</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setFormData({ ...formData, files: { ...formData.files, cinPasseport: e.target.files?.[0] || null } })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                      />
                      {formData.files.cinPasseport && (
                        <p className="text-sm text-green-600 mt-1">✓ {formData.files.cinPasseport.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Copie police d&apos;assurance voyage *</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setFormData({ ...formData, files: { ...formData.files, policeAssurance: e.target.files?.[0] || null } })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                      />
                      {formData.files.policeAssurance && (
                        <p className="text-sm text-green-600 mt-1">✓ {formData.files.policeAssurance.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Billets d&apos;avion + carte d&apos;embarquement *</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setFormData({ ...formData, files: { ...formData.files, billetsAvion: e.target.files?.[0] || null } })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                      />
                      {formData.files.billetsAvion && (
                        <p className="text-sm text-green-600 mt-1">✓ {formData.files.billetsAvion.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-2">Preuve de réservation (hôtel, agence…) (optionnel)</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setFormData({ ...formData, files: { ...formData.files, preuveReservation: e.target.files?.[0] || null } })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                      />
                      {formData.files.preuveReservation && (
                        <p className="text-sm text-green-600 mt-1">✓ {formData.files.preuveReservation.name}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Santé-specific fields */}
              {selectedType === "sante" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Type de sinistre santé *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: "medicaments_examens", label: "Médicaments / Examens" },
                        { id: "hospitalisation", label: "Hospitalisation" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSanteSubType(opt.id)}
                          className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            santeSubType === opt.id
                              ? "border-[#00a67e] bg-rose-50 text-[#00a67e]"
                              : "border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Base documents — always shown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: "feuilleSoins", label: "Feuille de soins *" },
                      { key: "rapportMedical", label: "Rapport / certificat médical *" },
                      { key: "facturesOriginales", label: "Factures originales *" }
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">{f.label}</label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setFormData({ ...formData, files: { ...formData.files, [f.key]: e.target.files?.[0] || null } })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                        />
                        {formData.files[f.key] && (
                          <p className="text-sm text-green-600 mt-1">✓ {formData.files[f.key].name}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Médicaments / Examens documents */}
                  {santeSubType === "medicaments_examens" && (
                    <div className="border border-rose-200 bg-rose-50/40 rounded-xl p-4 space-y-4">
                      <p className="text-sm font-semibold text-rose-700">Documents complémentaires — Médicaments / Examens</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { key: "facturesPharmacie", label: "Factures de pharmacie" },
                          { key: "resultatsAnalyses", label: "Résultats d'analyses / radios / scanner" },
                          { key: "prescription", label: "Prescription correspondante" }
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">{f.label}</label>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => setFormData({ ...formData, files: { ...formData.files, [f.key]: e.target.files?.[0] || null } })}
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                            />
                            {formData.files[f.key] && (
                              <p className="text-sm text-green-600 mt-1">✓ {formData.files[f.key].name}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hospitalisation documents */}
                  {santeSubType === "hospitalisation" && (
                    <div className="border border-rose-200 bg-rose-50/40 rounded-xl p-4 space-y-4">
                      <p className="text-sm font-semibold text-rose-700">Documents complémentaires — Hospitalisation</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { key: "bulletinHospitalisation", label: "Bulletin d'hospitalisation" },
                          { key: "factureClinic", label: "Facture de la clinique / hôpital" },
                          { key: "compteRenduHospitalisation", label: "Compte rendu d'hospitalisation" }
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">{f.label}</label>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => setFormData({ ...formData, files: { ...formData.files, [f.key]: e.target.files?.[0] || null } })}
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                            />
                            {formData.files[f.key] && (
                              <p className="text-sm text-green-600 mt-1">✓ {formData.files[f.key].name}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Bâtiment-specific fields */}
              {selectedType === "batiment" && (
                <>
                  {/* Subtype selector */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Type de sinistre bâtiment *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "degats_eaux",  label: "Dégâts des eaux" },
                        { id: "incendie",     label: "Incendie" },
                        { id: "gros_sinistre",label: "Gros sinistre" }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setBatimentSubType(opt.id)}
                          className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            batimentSubType === opt.id
                              ? "border-[#00a67e] bg-emerald-50 text-[#00a67e]"
                              : "border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Numéro de police (text) */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Numéro de police d&apos;assurance</label>
                    <input
                      type="text"
                      placeholder="Ex : POL-2024-XXXXXX"
                      value={formData.numeroPoliceBatiment}
                      onChange={(e) => setFormData({ ...formData, numeroPoliceBatiment: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                    />
                  </div>

                  {/* Base documents */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: "carteIdentiteBatiment",      label: "Copie de la carte d'identité *" },
                      { key: "contratAssuranceHabitation", label: "Copie du contrat d'assurance habitation *" },
                      { key: "declarationEcriteBatiment",  label: "Déclaration écrite du sinistre *" }
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">{f.label}</label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setFormData({ ...formData, files: { ...formData.files, [f.key]: e.target.files?.[0] || null } })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                        />
                        {formData.files[f.key] && <p className="text-sm text-green-600 mt-1">✓ {formData.files[f.key].name}</p>}
                      </div>
                    ))}
                  </div>

                  {/* Documents liés au sinistre */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: "photosDegats",       label: "Photos des dégâts *" },
                      { key: "listeBiensDommages", label: "Liste des biens endommagés" }
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">{f.label}</label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setFormData({ ...formData, files: { ...formData.files, [f.key]: e.target.files?.[0] || null } })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                        />
                        {formData.files[f.key] && <p className="text-sm text-green-600 mt-1">✓ {formData.files[f.key].name}</p>}
                      </div>
                    ))}
                  </div>

                  {/* Dégâts des eaux */}
                  {batimentSubType === "degats_eaux" && (
                    <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-4">
                      <p className="text-sm font-semibold text-emerald-700">Documents — Dégâts des eaux</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { key: "constatAmiableEaux",   label: "Constat amiable dégâts des eaux" },
                          { key: "coordonneesImpliques", label: "Coordonnées des personnes impliquées" }
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">{f.label}</label>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => setFormData({ ...formData, files: { ...formData.files, [f.key]: e.target.files?.[0] || null } })}
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                            />
                            {formData.files[f.key] && <p className="text-sm text-green-600 mt-1">✓ {formData.files[f.key].name}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Incendie */}
                  {batimentSubType === "incendie" && (
                    <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-4">
                      <p className="text-sm font-semibold text-emerald-700">Documents — Incendie</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { key: "rapportProtectionCivile", label: "Rapport de la protection civile / police" },
                          { key: "preuveIntervention",      label: "Preuve de l'intervention (si disponible)" }
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">{f.label}</label>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => setFormData({ ...formData, files: { ...formData.files, [f.key]: e.target.files?.[0] || null } })}
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                            />
                            {formData.files[f.key] && <p className="text-sm text-green-600 mt-1">✓ {formData.files[f.key].name}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gros sinistre */}
                  {batimentSubType === "gros_sinistre" && (
                    <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-4">
                      <p className="text-sm font-semibold text-emerald-700">Documents — Gros sinistre</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { key: "rapportExpert",  label: "Rapport d'expert" },
                          { key: "titrePropriete", label: "Titre de propriété ou contrat de location" }
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">{f.label}</label>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => setFormData({ ...formData, files: { ...formData.files, [f.key]: e.target.files?.[0] || null } })}
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                            />
                            {formData.files[f.key] && <p className="text-sm text-green-600 mt-1">✓ {formData.files[f.key].name}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* File uploads for Auto */}
              {selectedType === "auto" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Copie de l'attestation du tiers (optionnel)</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFormData({
                        ...formData,
                        files: { ...formData.files, attestationTiers: e.target.files?.[0] || null }
                      })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                    />
                    {formData.files.attestationTiers && (
                      <p className="text-sm text-green-600 mt-1">✓ {formData.files.attestationTiers.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Copie du constat *</label>
                    <input
                      type="file"
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setFormData({
                        ...formData,
                        files: { ...formData.files, constat: e.target.files?.[0] || null }
                      })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                    />
                    {formData.files.constat && (
                      <p className="text-sm text-green-600 mt-1">✓ {formData.files.constat.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">Photo du véhicule endommagé (optionnel)</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => setFormData({
                        ...formData,
                        files: { ...formData.files, photoVehicule: e.target.files?.[0] || null }
                      })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a67e]"
                    />
                    {formData.files.photoVehicule && (
                      <p className="text-sm text-green-600 mt-1">✓ {formData.files.photoVehicule.name}</p>
                    )}
                  </div>
                </>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#00a67e] hover:bg-[#008c6a] disabled:opacity-60 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
                >
                  {submitting ? "Envoi..." : "Envoyer la déclaration"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Changer de type
                </button>
              </div>
            </form>
          </section>
        )}

        {!isGestionnaire && !selectedType && (
          <p className="text-sm text-slate-500">
            Après avoir choisi un type, le formulaire de déclaration s&apos;affichera ici.
          </p>
        )}

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-[#1a365d]">Mes sinistres déclarés</h2>
            <Link
              to="/mon-sinistre"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#00a67e] hover:text-[#008c6a]"
            >
              Voir mon sinistre
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {claims.length === 0 ? (
            <p className="text-sm text-slate-500 mt-3">
              Vous n&apos;avez pas encore déclaré de sinistre.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {claims.slice(0, 3).map((claim) => (
                <div
                  key={claim._id}
                  className="rounded-xl border border-slate-200 px-4 py-3 bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-[#1a365d]">
                      Sinistre #{claim._id.slice(-6)}
                    </p>
                    <span className="text-xs font-medium text-slate-600">
                      {formatDate(claim.date)}
                    </span>
                  </div>
                  <p className="text-sm text-[#00a67e] mt-1">
                    {getSinistreTypeLabel(claim.sinistreType) || "Type non spécifié"}
                  </p>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                    {claim.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
