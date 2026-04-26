import { useContext, useRef, useState } from "react";
import API from "../api/axios";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";

const BACKEND = "http://localhost:5000";

export default function Profile() {
  const { user, setUser, logout } = useContext(AuthContext);
  const avatarInputRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await API.post("/users/avatar", fd);
      setUser(res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors du téléversement");
    } finally {
      setAvatarLoading(false);
      e.target.value = "";
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      // Add password only if user wants to change it
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setErrorMessage("Les mots de passe ne correspondent pas");
          setLoading(false);
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await API.put("/users/profile", updateData);
      setSuccessMessage("Profil mis à jour avec succès!");
      setFormData({
        ...formData,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      // Optional: refresh user context
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations personnelles</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {user?.avatar ? (
                    <img
                      src={`${BACKEND}/uploads/${user.avatar.split(/[/\\]/).pop()}`}
                      alt="avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  {avatarLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user?.name || "Utilisateur"}</h2>
                <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Rôle: <span className="font-semibold">{user?.role || "Client"}</span>
                </p>
              </div>

              <div className="space-y-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  disabled={avatarLoading}
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-60"
                >
                  {avatarLoading ? "Téléversement..." : "Modifier l'avatar"}
                </button>
                <button
                  onClick={logout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Modifier mes informations</h3>

              {/* Messages */}
              {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  ✓ {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  ✗ {errorMessage}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Personal Information Section */}
                <div className="pb-6 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Informations personnelles</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Adresse email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ℹ️ L'email ne peut être modifié que par l'administrateur
                      </p>
                    </div>
                  </div>
                </div>

                {/* Change Password Section */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Changer mon mot de passe</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        placeholder="Entrez votre mot de passe actuel"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        placeholder="Entrez un nouveau mot de passe"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        placeholder="Confirmez votre nouveau mot de passe"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                      💡 Laissez vide si vous ne souhaitez pas changer votre mot de passe
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      name: user?.name || "",
                      email: user?.email || "",
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    })}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all"
                  >
                    Réinitialiser
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-gray-700">Notifications par email</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-gray-700">Mises à jour de sinistre</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-gray-700">Rappels de contrat</span>
              </label>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Sécurité</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-900 text-sm">✓ Compte sécurisé</span>
              </div>
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-all text-sm">
                Authentification à deux facteurs
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
