import {
  bufferToBase64url
} from "./index-2cp5044h.js";

// src/client/api-client.ts
var DEFAULT_SERVER_URL = "https://encryptid.jeffemmett.com";

class EncryptIDClient {
  serverUrl;
  constructor(serverUrl = DEFAULT_SERVER_URL) {
    this.serverUrl = serverUrl.replace(/\/$/, "");
  }
  async registerStart(username, displayName) {
    const res = await fetch(`${this.serverUrl}/api/register/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, displayName: displayName || username })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Registration start failed" }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }
  async registerComplete(challenge, credential, userId, username) {
    const response = credential.response;
    const publicKey = response.getPublicKey();
    const res = await fetch(`${this.serverUrl}/api/register/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challenge,
        userId,
        username,
        credential: {
          credentialId: bufferToBase64url(credential.rawId),
          publicKey: publicKey ? bufferToBase64url(publicKey) : "",
          transports: response.getTransports?.() || []
        }
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Registration complete failed" }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }
  async authStart(credentialId) {
    const res = await fetch(`${this.serverUrl}/api/auth/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentialId ? { credentialId } : {})
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Auth start failed" }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }
  async authComplete(challenge, credential) {
    const response = credential.response;
    const prfResults = credential.getClientExtensionResults()?.prf?.results;
    const res = await fetch(`${this.serverUrl}/api/auth/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challenge,
        credential: {
          credentialId: bufferToBase64url(credential.rawId),
          signature: bufferToBase64url(response.signature),
          authenticatorData: bufferToBase64url(response.authenticatorData),
          prfOutput: prfResults?.first ? bufferToBase64url(prfResults.first) : null
        }
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Auth complete failed" }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }
  async verifySession(token) {
    const res = await fetch(`${this.serverUrl}/api/session/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  }
  async refreshToken(token) {
    const res = await fetch(`${this.serverUrl}/api/session/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Token refresh failed" }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }
  async listCredentials(token) {
    const res = await fetch(`${this.serverUrl}/api/user/credentials`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      throw new Error("Failed to list credentials");
    }
    return res.json();
  }
  async register(username, displayName, config) {
    const { options, userId } = await this.registerStart(username, displayName);
    const createOptions = {
      publicKey: {
        ...options,
        challenge: base64urlToUint8Array(options.challenge),
        user: {
          ...options.user,
          id: base64urlToUint8Array(options.user.id)
        },
        pubKeyCredParams: options.pubKeyCredParams,
        extensions: {
          credProps: true,
          prf: { eval: { first: new Uint8Array(32) } }
        }
      }
    };
    const credential = await navigator.credentials.create(createOptions);
    if (!credential)
      throw new Error("Failed to create credential");
    return this.registerComplete(options.challenge, credential, userId, username);
  }
  async authenticate(credentialId, config) {
    const { options } = await this.authStart(credentialId);
    const getOptions = {
      publicKey: {
        challenge: base64urlToUint8Array(options.challenge),
        rpId: options.rpId,
        userVerification: options.userVerification,
        timeout: options.timeout,
        allowCredentials: options.allowCredentials?.map((c) => ({
          type: c.type,
          id: base64urlToUint8Array(c.id),
          transports: c.transports
        })),
        extensions: {
          prf: { eval: { first: new Uint8Array(32) } }
        }
      }
    };
    const credential = await navigator.credentials.get(getOptions);
    if (!credential)
      throw new Error("Authentication failed");
    const result = await this.authComplete(options.challenge, credential);
    const prfResults = credential.getClientExtensionResults()?.prf?.results;
    return {
      ...result,
      prfOutput: prfResults?.first
    };
  }
}
function base64urlToUint8Array(base64url) {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0;i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export { EncryptIDClient };
