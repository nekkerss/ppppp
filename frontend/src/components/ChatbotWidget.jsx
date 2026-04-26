import { useContext, useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { ChatContext } from "../context/ChatContext";
import API from "../api/axios";

const INITIAL_MESSAGE = {
  role: "bot",
  text: "Bonjour ! Je suis votre assistant BNA Assurances. Comment puis-je vous aider aujourd'hui ?"
};

const quickPrompts = [
  "Quels types d'assurance proposez-vous ?",
  "Comment déclarer un sinistre ?",
  "Comment demander un devis ?",
  "Où voir mes contrats ?"
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-xl w-fit">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-[#00a67e] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function ChatbotWidget() {
  const { chatOpen, setChatOpen } = useContext(ChatContext);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (chatOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, chatOpen]);

  const submitMessage = async (messageText) => {
    const text = messageText.trim();
    if (!text || isLoading) return;

    const updatedMessages = [...messages, { role: "user", text }];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await API.post("/chat", { messages: updatedMessages });
      const reply = res.data.reply || "Je suis désolé, une erreur s'est produite.";
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Service temporairement indisponible. Veuillez réessayer ou contacter un gestionnaire via la page Messages." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end">
      {chatOpen && (
        <div className="mb-3 w-[320px] sm:w-[370px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0f2744] text-white">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="w-5 h-5 text-[#00d1a0]" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00a67e] border border-[#0f2744]" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-none">Assistant BNA</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isLoading ? "En train d'écrire..." : "En ligne"}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setChatOpen(false)} aria-label="Fermer">
              <X className="w-4 h-4 text-slate-400 hover:text-white transition-colors" />
            </button>
          </div>

          {/* Messages */}
          <div className="p-4 space-y-3 h-72 overflow-y-auto bg-slate-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "bot" && (
                  <div className="w-6 h-6 rounded-full bg-[#0f2744] flex items-center justify-center mr-2 mt-1 shrink-0">
                    <Bot className="w-3 h-3 text-[#00d1a0]" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3 py-2 text-sm max-w-[80%] leading-relaxed ${
                    message.role === "bot"
                      ? "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"
                      : "bg-[#00a67e] text-white rounded-tr-sm"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-[#0f2744] flex items-center justify-center mr-2 mt-1 shrink-0">
                  <Bot className="w-3 h-3 text-[#00d1a0]" />
                </div>
                <TypingIndicator />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick prompts + Input */}
          <div className="px-4 pb-4 pt-3 border-t border-slate-100 bg-white space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isLoading}
                  onClick={() => submitMessage(prompt)}
                  className="text-xs rounded-full border border-slate-200 px-3 py-1 hover:border-[#00a67e] hover:text-[#008c6a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              className="flex items-center gap-2"
              onSubmit={(e) => { e.preventDefault(); submitMessage(input); }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                placeholder="Écrire votre question..."
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00a67e]/40 disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="rounded-xl bg-[#00a67e] hover:bg-[#008c6a] text-white p-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Envoyer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle button */}
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
