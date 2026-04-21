import { createContext, useEffect, useState } from "react";
import API from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const res = await API.get("/users/profile");
        setUser(res.data);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (data) => {
    try {
      console.log("DATA SENT:", data);
      const res = await API.post("/auth/login", data);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (error) {
      const responseData = error.response?.data;
      const message = responseData?.message || error.message || "Login failed";
      console.error("Login error:", message);

      // Check if email verification is required
      if (responseData?.requiresVerification) {
        return {
          success: false,
          message,
          requiresVerification: true,
          email: responseData.email
        };
      }

      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};