import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const ROLE_HOME = {
  Admin: "/admin/dashboard",
  Donor: "/donor/dashboard",
  Receiver: "/receiver/dashboard",
  Volunteer: "/volunteer/dashboard",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
  try {
    const u = JSON.parse(localStorage.getItem("user"));
    return u && ROLE_HOME[u.role] ? u : null;
  } catch {
    return null;
  }
});

  const login = ({ token, role, name }) => {
    const u = { role, name };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
