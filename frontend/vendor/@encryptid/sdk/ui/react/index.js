import {
  EncryptIDClient
} from "../../index-7egxprg9.js";
import"../../index-2cp5044h.js";

// src/ui/react/EncryptIDProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
var EncryptIDContext = createContext(null);
var TOKEN_KEY = "encryptid_token";
function EncryptIDProvider({ children, serverUrl }) {
  const [client] = useState(() => new EncryptIDClient(serverUrl));
  const [token, setToken] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      client.verifySession(stored).then((res) => {
        if (res.valid) {
          setToken(stored);
          try {
            const payload = JSON.parse(atob(stored.split(".")[1]));
            setClaims(payload);
          } catch {}
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      }).catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [client]);
  const register = useCallback(async (username, displayName) => {
    setLoading(true);
    try {
      const result = await client.register(username, displayName);
      setToken(result.token);
      localStorage.setItem(TOKEN_KEY, result.token);
      try {
        setClaims(JSON.parse(atob(result.token.split(".")[1])));
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [client]);
  const login = useCallback(async (credentialId) => {
    setLoading(true);
    try {
      const result = await client.authenticate(credentialId);
      setToken(result.token);
      localStorage.setItem(TOKEN_KEY, result.token);
      try {
        setClaims(JSON.parse(atob(result.token.split(".")[1])));
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [client]);
  const logout = useCallback(() => {
    setToken(null);
    setClaims(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("encryptid_session");
  }, []);
  const value = {
    isAuthenticated: !!token,
    token,
    claims,
    did: claims?.did || claims?.sub || null,
    username: claims?.username || null,
    loading,
    register,
    login,
    logout,
    client
  };
  return React.createElement(EncryptIDContext.Provider, { value }, children);
}
function useEncryptID() {
  const ctx = useContext(EncryptIDContext);
  if (!ctx)
    throw new Error("useEncryptID must be used within <EncryptIDProvider>");
  return ctx;
}
// src/ui/react/LoginButton.tsx
import React2, { useState as useState2, useCallback as useCallback2 } from "react";
function LoginButton({
  label = "Sign in with Passkey",
  size = "medium",
  variant = "primary",
  onSuccess,
  onError,
  onRegisterNeeded,
  className = ""
}) {
  const { login, isAuthenticated, did, logout, loading: contextLoading } = useEncryptID();
  const [loading, setLoading] = useState2(false);
  const handleClick = useCallback2(async () => {
    if (isAuthenticated) {
      logout();
      return;
    }
    setLoading(true);
    try {
      await login();
      const token = localStorage.getItem("encryptid_token") || "";
      const currentDid = did || "";
      onSuccess?.({ token, did: currentDid });
    } catch (error) {
      if (error.name === "NotAllowedError") {
        onRegisterNeeded?.();
      } else {
        onError?.(error);
      }
    } finally {
      setLoading(false);
    }
  }, [login, logout, isAuthenticated, did, onSuccess, onError, onRegisterNeeded]);
  const isLoading = loading || contextLoading;
  const sizeStyles = {
    small: { padding: "8px 16px", fontSize: "0.875rem" },
    medium: { padding: "12px 24px", fontSize: "1rem" },
    large: { padding: "16px 32px", fontSize: "1.125rem" }
  };
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    border: "none",
    borderRadius: "8px",
    fontWeight: 500,
    cursor: isLoading ? "not-allowed" : "pointer",
    opacity: isLoading ? 0.6 : 1,
    transition: "all 0.2s",
    fontFamily: "system-ui, -apple-system, sans-serif",
    ...sizeStyles[size],
    ...variant === "primary" ? { background: "#06b6d4", color: "white" } : { background: "transparent", border: "2px solid #06b6d4", color: "#06b6d4" }
  };
  return React2.createElement("button", {
    onClick: handleClick,
    disabled: isLoading,
    style: baseStyle,
    className
  }, isLoading ? React2.createElement("span", null, "Authenticating...") : React2.createElement(React2.Fragment, null, React2.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { width: "24px", height: "24px" }
  }, React2.createElement("circle", { cx: 12, cy: 10, r: 3 }), React2.createElement("path", { d: "M12 13v8" }), React2.createElement("path", { d: "M9 18h6" }), React2.createElement("circle", { cx: 12, cy: 10, r: 7 })), React2.createElement("span", null, isAuthenticated ? "Sign Out" : label)));
}
export {
  useEncryptID,
  LoginButton,
  EncryptIDProvider
};
