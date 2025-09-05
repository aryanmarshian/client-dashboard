import React from "react";

type AdminContextType = {
  isAdmin: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AdminContext = React.createContext<AdminContextType | null>(null);

export const AdminProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [isAdmin, setIsAdmin] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem("isAdmin") === "true";
    } catch {
      return false;
    }
  });

  const login = (email: string, password: string) => {
    // Hard-coded credentials (as requested)
    const ok = email === "admin@sol.com" && password === "987654";
    if (ok) {
      setIsAdmin(true);
      try {
        localStorage.setItem("isAdmin", "true");
      } catch {}
    }
    return ok;
  };

  const logout = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem("isAdmin");
    } catch {}
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = React.useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};

export default useAdmin;
