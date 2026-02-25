import {
  verifyEncryptIDToken
} from "./index-stg63j73.js";

// src/server/ws-auth.ts
async function authenticateWSUpgrade(request, options = {}) {
  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");
  if (queryToken) {
    try {
      return await verifyEncryptIDToken(queryToken, options);
    } catch {
      return null;
    }
  }
  const protocols = request.headers.get("Sec-WebSocket-Protocol") || "";
  const tokenProtocol = protocols.split(",").map((p) => p.trim()).find((p) => p.startsWith("encryptid."));
  if (tokenProtocol) {
    const token = tokenProtocol.slice("encryptid.".length);
    try {
      return await verifyEncryptIDToken(token, options);
    } catch {
      return null;
    }
  }
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/encryptid_token=([^;]+)/);
  if (match) {
    try {
      return await verifyEncryptIDToken(match[1], options);
    } catch {
      return null;
    }
  }
  return null;
}

export { authenticateWSUpgrade };
