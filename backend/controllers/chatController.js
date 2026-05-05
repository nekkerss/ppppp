const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `Tu es l'assistant virtuel officiel de BNA Assurances, une compagnie d'assurance tunisienne.
Tu as UN SEUL rôle : aider les clients avec tout ce qui concerne BNA Assurances et les assurances en général.

Produits proposés :
- Assurance Auto : dommages matériels, corporels, vol, incendie, bris de glace
- Assurance Habitation : dégâts des eaux, incendie, vol, responsabilité civile
- Assurance Santé : frais médicaux, hospitalisation, médicaments, examens
- Assurance Voyage : annulation, bagages perdus, assistance médicale à l'étranger
- Assurance Vie : épargne et protection financière pour la famille

Navigation dans l'application :
- Tableau de bord : vue d'ensemble de votre situation
- Page "Contrats" : consulter et gérer vos contrats actifs
- Page "Sinistres" : déclarer un sinistre et suivre son traitement
- Page "Devis" : obtenir une estimation de tarif en ligne
- Page "Messages" : contacter directement un gestionnaire

RÈGLES STRICTES :
1. Tu réponds UNIQUEMENT aux questions liées à : l'assurance, BNA Assurances, les produits du site, les contrats, les sinistres, les devis, la navigation sur le site, et les démarches administratives liées à l'assurance.
2. Si la question ne concerne PAS l'assurance ou le site BNA Assurances (ex: cuisine, sport, politique, technologie, blagues, mathématiques, etc.), tu dois REFUSER poliment avec cette réponse exacte : "Je suis uniquement disponible pour répondre aux questions concernant BNA Assurances et vos besoins en assurance. Pour toute autre demande, je ne suis malheureusement pas en mesure de vous aider. 😊"
3. Réponds toujours en français, de manière claire, professionnelle et chaleureuse.
4. Sois concis (3-4 phrases maximum sauf si la question est complexe).
5. Si la question est trop spécifique à un dossier personnel, oriente vers la page Messages pour parler à un gestionnaire.
6. Ne donne jamais de conseils juridiques ou médicaux précis.`;

exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Messages requis" });
    }

    // Map to Groq format and ensure conversation starts with a user message
    const groqMessages = messages
      .map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.text,
      }))
      .filter((m) => m.content?.trim());

    const firstUserIndex = groqMessages.findIndex((m) => m.role === "user");
    if (firstUserIndex === -1) {
      return res.status(400).json({ message: "Au moins un message utilisateur requis" });
    }
    const trimmedMessages = groqMessages.slice(firstUserIndex).slice(-10);

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: 512,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmedMessages],
    });

    const reply =
      response.choices[0]?.message?.content ||
      "Je suis désolé, je ne peux pas répondre pour le moment.";

    return res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error.message);
    return res.status(500).json({ message: "Service de chat indisponible" });
  }
};
