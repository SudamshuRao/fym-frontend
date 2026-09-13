import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authApi from "../api/auth";
import { UserOut } from "../api/types";

const TOKEN_STORAGE_KEY = "fym_access_token";

interface AuthContextValue {
  user: UserOut | null;
  isLoading: boolean; // true only during the initial "restore session" check
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On app start: check if a token was saved from a previous session,
  // and if so, validate it against /auth/me rather than trusting it
  // blindly (it may have expired).
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        if (savedToken) {
          const me = await authApi.getMe(savedToken);
          setUser(me);
        }
      } catch {
        // Saved token is invalid/expired - clear it and just show the login screen.
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    setError(null);
    try {
      const token = await authApi.login(email, password);
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token.access_token);
      const me = await authApi.getMe(token.access_token);
      setUser(me);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
      throw e;
    }
  }

  async function register(email: string, password: string) {
    setError(null);
    try {
      await authApi.register(email, password);
      // Registration doesn't log the user in automatically on the
      // backend - immediately log in with the same credentials so the
      // user doesn't have to type them twice.
      await login(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
      throw e;
    }
  }

  async function logout() {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
