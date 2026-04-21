import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MapComponent from "../components/MapComponent";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="pt-20 md:pt-24">
        <section className="bg-gradient-to-br from-[#0f2744] via-[#153356] to-[#1a3a5c] text-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
            <h1 className="text-4xl font-bold md:text-5xl">Contactez-nous</h1>
            <p className="mt-4 max-w-2xl text-blue-100/90">
              Notre equipe vous repond rapidement pour vos demandes de devis, de contrats ou de sinistres.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
            {/* LEFT — form (logic unchanged) */}
            <form
              onSubmit={handleSubmit}
              className="order-1 flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
            >
              <h2 className="text-2xl font-bold text-[#1a365d]">Contact form</h2>
              <div className="mt-6 space-y-4">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  placeholder="Nom complet"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#00a67e]/40"
                />
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="Email"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#00a67e]/40"
                />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel"
                  placeholder="Telephone"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#00a67e]/40"
                />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Votre message"
                  rows={5}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#00a67e]/40"
                />
              </div>
              <button
                type="submit"
                className="mt-6 rounded-xl bg-[#00a67e] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#008c6a]"
              >
                Envoyer
              </button>
            </form>

            {/* RIGHT — map */}
            <div className="order-2 flex min-h-[420px] flex-col lg:min-h-0">
              <h2 className="mb-3 text-lg font-semibold text-[#1a365d] lg:hidden">Nos agences</h2>
              <div className="min-h-[420px] flex-1 lg:min-h-[560px]">
                <MapComponent />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
