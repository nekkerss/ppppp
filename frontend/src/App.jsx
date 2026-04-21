import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailVerification from "./pages/EmailVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Actualites from "./pages/Actualites";
import Dashboard from "./pages/Dashboard";
import Quotes from "./pages/Quotes";
import Claims from "./pages/Claims";
import MonSinistre from "./pages/MonSinistre";
import SinistreDeclaration from "./pages/SinistreDeclaration";
import Contracts from "./pages/Contracts";
import Documents from "./pages/Documents";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import GestionnaireDashboard from "./pages/GestionnaireDashboard";
import UserDossiers from "./pages/UserDossiers";
import ServiceDetails from "./pages/ServiceDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ChatbotWidget from "./components/ChatbotWidget";

// Auth
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { useContext } from "react";

function ProtectedRoute({ children }) {
  const { user, authLoading } = useContext(AuthContext);
  if (authLoading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function StaffRoute({ children }) {
  const { user, authLoading } = useContext(AuthContext);
  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return ["admin", "gestionnaire"].includes(user.role) ? children : <Navigate to="/actualites" replace />;
}

function AppRoutes() {
  const { user } = useContext(AuthContext);

  const defaultAuthenticatedRoute =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "gestionnaire"
        ? "/gestionnaire/dashboard"
        : "/dashboard";

  return (
    <Routes>
      {/* Home / Hero Page */}
      <Route path="/" element={<Home />} />
      <Route path="/services/:type" element={<ServiceDetails />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Main Pages */}
      <Route path="/actualites" element={<Actualites />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/quotes" element={<ProtectedRoute><Quotes /></ProtectedRoute>} />
      <Route path="/claims" element={<ProtectedRoute><Claims /></ProtectedRoute>} />
      <Route path="/mon-sinistre" element={<ProtectedRoute><MonSinistre /></ProtectedRoute>} />
      <Route path="/declaration-sinistre" element={<ProtectedRoute><SinistreDeclaration /></ProtectedRoute>} />
      <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<StaffRoute><AdminDashboard /></StaffRoute>} />
      <Route path="/gestionnaire/dashboard" element={<StaffRoute><GestionnaireDashboard /></StaffRoute>} />
      <Route path="/gestionnaire/dossiers" element={<StaffRoute><UserDossiers /></StaffRoute>} />
      <Route path="/admin" element={<StaffRoute><Navigate to="/admin/dashboard" replace /></StaffRoute>} />

      <Route path="*" element={<Navigate to={user ? defaultAuthenticatedRoute : "/login"} replace />} />
    </Routes>
  );
}

function AuthChatbot() {
  const { user, authLoading } = useContext(AuthContext);
  const isStaff = ["admin", "gestionnaire"].includes(user?.role);
  if (authLoading || !user || isStaff) return null;
  return <ChatbotWidget />;
}

function App() {
  return (
    <ChatProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <AuthChatbot />
        </BrowserRouter>
      </AuthProvider>
    </ChatProvider>
  );
}

export default App;