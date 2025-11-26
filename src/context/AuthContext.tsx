// src/context/AuthContext.tsx
import React, { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

type AuthUser = {
  username: string;
  roles: string[];
};

type AuthContextType = {
  user: AuthUser | null;
  accessToken: string | null;
  login: (
    accessToken: string,
    refreshToken: string,
    username: string,
    roles: string[]
  ) => void;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
};

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

type Props = {
  children: ReactNode;
};

type JwtPayload = {
  sub?: string;
  roles?: string[];
  [key: string]: unknown;
};

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedUsername = localStorage.getItem("username");
    const storedRoles = localStorage.getItem("roles");

    if (storedAccessToken && storedUsername && storedRoles) {
      setAccessToken(storedAccessToken);
      setUser({
        username: storedUsername,
        roles: JSON.parse(storedRoles),
      });
    }
  }, []);

  const login = (
    newAccessToken: string,
    refreshToken: string,
    username: string,
    roles: string[]
  ) => {
    // Guardar en localStorage
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("username", username);
    localStorage.setItem("roles", JSON.stringify(roles));

    setAccessToken(newAccessToken);
    setUser({ username, roles });

    // Opcional: sobreescribir con lo que venga en el token
    try {
      const decoded = jwtDecode<JwtPayload>(newAccessToken);
      const decodedUsername = (decoded.sub as string) || username;
      const decodedRoles = Array.isArray(decoded.roles) ? decoded.roles : roles;

      setUser({
        username: decodedUsername,
        roles: decodedRoles,
      });
    } catch (error) {
      console.warn("No se pudo decodificar el token JWT", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("roles");
    setAccessToken(null);
    setUser(null);
  };

  const hasRole = (...requiredRoles: string[]) => {
    if (!user) return false;
    return user.roles.some((role) => requiredRoles.includes(role));
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
