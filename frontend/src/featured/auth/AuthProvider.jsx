import { useEffect, useState } from "react";
import { AuthContext } from "./auth.context";
import { getme } from "./services/auth.api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getme()
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser);
      })
      .catch((error) => {
        if (error?.response?.status !== 401) {
          console.error("Failed to fetch the current user:", error);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
