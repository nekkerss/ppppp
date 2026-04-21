import { useMemo, useState, useContext } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { ChatContext } from "../context/ChatContext";

const responses = {
  insurance:
    "Nous proposons des assurances auto, sante et habitation avec des formules adaptables selon votre profil.",
  claim:
    "Pour declarer un sinistre, rendez-vous dans l'espace client puis ouvrez la section Reclamations.",
  contract:
    "Vos contrats actifs et leurs echeances sont visibles dans votre tableau de bord et la page Contrats.",
  quotation:
    "Vous pouvez demander un devis en quelques clics depuis la section Devis ou via les actions rapides."
};

const quickPrompts = [
  "Quels types d'assurance proposez-vous ?",
  "Comment declarer un sinistre ?",
  "Ou voir mes contrats ?",
  "Comment demander un devis ?"
];

function getResponse(message) {
  const text = message.toLowerCase();
  if (text.includes("sinistre") || text.includes("claim")) return responses.claim;
  if (text.includes("contrat") || text.includes("contract")) return responses.contract;
  if (text.includes("devis") || text.includes("quotation")) return responses.quotation;
  if (text.includes("assurance") || text.includes("insurance")) return responses.insurance;
  return "Je peux vous aider sur les assurances, les sinistres, les contrats et les devis. Posez-moi une question sur ces sujets.";
}

export default function ChatbotWidget() {
  const { chatOpen, setChatOpen } = useContext(ChatContext);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "Bonjour, je suis votre assistant assurance. Comment puis-je vous aider ?" }
  ]);

  const displayedMessages = useMemo(() => messages.slice(-8), [messages]);

  const submitMessage = (messageText) => {
    const text = messageText.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text }, { role: "bot", text: getResponse(text) }]);
    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end">
      {chatOpen && (
        <div className="mb-3 w-[320px] sm:w-[360px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between px-4 py-3 bg-[#0f2744] text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#00d1a0]" />
              <p className="font-semibold text-sm">Assistant Assurance</p>
            </div>
            <button type="button" onClick={() => setChatOpen(false)} aria-label="Fermer le chatbot">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3 max-h-80 overflow-y-auto bg-slate-50">
            {displayedMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-xl px-3 py-2 text-sm ${
                  message.role === "bot"
                    ? "bg-white border border-slate-200 text-slate-700"
                    : "bg-[#00a67e] text-white ml-8"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="px-4 pb-3 pt-2 border-t border-slate-200">
            <div className="flex flex-wrap gap-2 mb-3">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => submitMessage(prompt)}
                  className="text-xs rounded-full border border-slate-300 px-3 py-1 hover:border-[#00a67e] hover:text-[#008c6a] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                submitMessage(input);
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ecrire votre question..."
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00a67e]/40"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#00a67e] hover:bg-[#008c6a] text-white p-2 transition-colors"
                aria-label="Envoyer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setChatOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full bg-[#00a67e] hover:bg-[#008c6a] text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105"
        aria-label="Ouvrir le chatbot"
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    </div>
  );
}
