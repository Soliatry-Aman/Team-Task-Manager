import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Safe default state
  const [user, setUser] = useState(null);

  // Prevent app rendering before auth check
  const [loading, setLoading] = useState(true);

  // Restore auth state on refresh
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      // If both exist, restore session
      if (savedUser && token) {
        const parsedUser = JSON.parse(savedUser);

        // Extra safety check
        if (parsedUser && typeof parsedUser === "object") {
          setUser(parsedUser);
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      } else {
        // Missing either token or user
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } catch (error) {
      // Invalid JSON or corrupted storage
      console.error("Auth restore failed:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      setUser(null);
    } finally {
      // App ready
      setLoading(false);
    }
  }, []);

  // Login user
  const login = (data) => {
    try {
      if (!data?.token || !data?.user) {
        throw new Error("Invalid login data");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Logout user
  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser, // optional: useful for profile update
        login,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Safe custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};