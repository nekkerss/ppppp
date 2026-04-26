const Groq = require("groq-sdk");
const Quote = require("../models/Quote");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TYPE_LABELS = {
  auto:      "Assurance Automobile",
  sante:     "Assurance Santé",
  habitation:"Assurance Habitation",
  voyage:    "Assurance Voyage",
  vie:       "Assurance Vie",
};

async function getAIPrice(type, parametres) {
  const paramStr = Object.entries(parametres)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  const response = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    max_tokens: 250,
    messages: [
      {
        role: "system",
        content:
          "Tu es un expert en tarification d'assurance pour BNA Assurances en Algérie. " +
          "Réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après.",
      },
      {
        role: "user",
        content:
          `Calcule une prime annuelle réaliste en dinars tunisiens (TND) pour une ${TYPE_LABELS[type] || type} ` +
          `avec ces paramètres: ${paramStr}. ` +
          `Réponds avec ce format exact: {"prix": 850, "explication": "Explication en 2 phrases max en français expliquant les facteurs du tarif."}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim() || "";
  // Extract JSON even if there is surrounding text
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid AI response format");
  const parsed = JSON.parse(match[0]);
  return {
    prix: Math.round(Number(parsed.prix)),
    explication: parsed.explication || "",
  };
}

// POST /api/quotes — create and save a quote
exports.createQuote = async (req, res) => {
  try {
    const { type, parametres } = req.body;
    if (!type || !parametres) {
      return res.status(400).json({ message: "Type et paramètres requis" });
    }

    const { prix, explication } = await getAIPrice(type, parametres);

    const quote = new Quote({
      userId: req.user.id,
      type,
      prix,
      explication,
      parametres,
    });
    await quote.save();
    return res.json(quote);
  } catch (error) {
    console.error("Quote error:", error.message);
    return res.status(500).json({ message: "Erreur lors de la génération du devis" });
  }
};

// GET /api/quotes — list user's quotes
exports.getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(quotes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/quotes/estimate — price estimate without saving (used by payment modal)
exports.estimateQuote = async (req, res) => {
  try {
    const { type, parametres } = req.body;
    if (!type || !parametres) {
      return res.status(400).json({ message: "Type et paramètres requis" });
    }
    const { prix, explication } = await getAIPrice(type, parametres);
    return res.json({ prix, explication });
  } catch (error) {
    console.error("Estimate error:", error.message);
    return res.status(500).json({ message: "Estimation indisponible" });
  }
};
