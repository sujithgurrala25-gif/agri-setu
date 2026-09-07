import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    const token = localStorage.getItem("agrisetu_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      setFarmerProfile(data.farmerProfile || null);
    } catch {
      localStorage.removeItem("agrisetu_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("agrisetu_token", data.token);
    setUser(data.user);
    await loadMe();
    return data.user;
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("agrisetu_token", data.token);
    setUser(data.user);
    await loadMe();
    return data.user;
  }

  function logout() {
    localStorage.removeItem("agrisetu_token");
    setUser(null);
    setFarmerProfile(null);
  }

  const value = useMemo(
    () => ({ user, farmerProfile, loading, login, register, logout, reload: loadMe }),
    [user, farmerProfile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
