import { createContext, useContext, useState, useEffect } from "react";
import { orpcClient } from "../orpcClient.js";

const normalizeUser = (nextUser) => ({
  ...nextUser,
  avatarId: nextUser?.avatarId || "logo",
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load active session on mount
    const activeUser = localStorage.getItem("expense_tracker_current_user");
    const activeToken = localStorage.getItem("expense_tracker_token");

    if (activeUser && activeToken) {
      try {
        setUser(normalizeUser(JSON.parse(activeUser)));
      } catch (e) {
        localStorage.removeItem("expense_tracker_current_user");
        localStorage.removeItem("expense_tracker_token");
      }
    }
    setLoading(false);
  }, []);

  const register = async (name, email, password) => {
    try {
      const res = await orpcClient.auth.register({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
      });

      const nextUser = normalizeUser(res.user);
      setUser(nextUser);
      localStorage.setItem("expense_tracker_token", res.token);
      localStorage.setItem("expense_tracker_current_user", JSON.stringify(nextUser));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "An error occurred during registration.",
      };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await orpcClient.auth.login({
        email: email.toLowerCase().trim(),
        password,
      });

      const nextUser = normalizeUser(res.user);
      setUser(nextUser);
      localStorage.setItem("expense_tracker_token", res.token);
      localStorage.setItem("expense_tracker_current_user", JSON.stringify(nextUser));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Invalid email or password.",
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("expense_tracker_token");
    localStorage.removeItem("expense_tracker_current_user");
  };

  const updateProfile = async ({ name, avatarId }) => {
    try {
      const res = await orpcClient.auth.updateProfile({
        name: name.trim(),
        avatarId: avatarId || user?.avatarId || "logo",
      });

      const nextUser = normalizeUser(res.user);
      setUser(nextUser);
      localStorage.setItem("expense_tracker_token", res.token);
      localStorage.setItem("expense_tracker_current_user", JSON.stringify(nextUser));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Unable to update your profile.",
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, updateProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
