// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import apiClient from "../api/apiClient";

type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  roles: string[];
};

type AuthState = {
  isAuthenticated: boolean;
  username: string | null;
  roles: string[];
  accessToken: string | null;
};

type AuthContextValue = AuthState & {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
    roles: [],
    accessToken: null,
  });

  // Cargar token/usuario/roles desde localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUsername = localStorage.getItem("username");
    const storedRoles = localStorage.getItem("roles");

    if (storedToken && storedUsername && storedRoles) {
      setAuth({
        isAuthenticated: true,
        username: storedUsername,
        roles: JSON.parse(storedRoles),
        accessToken: storedToken,
      });
    }
  }, []);

  const login = async (username: string, password: string) => {
    const response = await apiClient.post<LoginResponse>("/api/auth/login", {
      username,
      password,
    });

    const data = response.data;

    // Guardar en localStorage
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("username", data.username);
    localStorage.setItem("roles", JSON.stringify(data.roles));

    setAuth({
      isAuthenticated: true,
      username: data.username,
      roles: data.roles,
      accessToken: data.accessToken,
    });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
    localStorage.removeItem("roles");

    setAuth({
      isAuthenticated: false,
      username: null,
      roles: [],
      accessToken: null,
    });
  };

  const hasRole = (...requiredRoles: string[]) => {
    if (!auth.isAuthenticated) return false;
    if (!auth.roles.length) return false;
    return auth.roles.some((role) => requiredRoles.includes(role));
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};