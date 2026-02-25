// src/server/jwt-verify.ts
var ENCRYPTID_SERVER = "https://encryptid.jeffemmett.com";
async function verifyEncryptIDToken(token, options = {}) {
  const { secret, serverUrl = ENCRYPTID_SERVER, audience, clockTolerance = 30 } = options;
  if (secret) {
    return verifyLocally(token, secret, audience, clockTolerance);
  }
  return verifyRemotely(token, serverUrl);
}
async function verifyLocally(token, secret, audience, clockTolerance = 30) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  const [headerB64, payloadB64, signatureB64] = parts;
  const encoder = new TextEncoder;
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = base64urlDecode(signatureB64);
  const valid = await crypto.subtle.verify("HMAC", key, signature, data);
  if (!valid) {
    throw new Error("Invalid JWT signature");
  }
  const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadB64)));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp + clockTolerance) {
    throw new Error("Token expired");
  }
  if (audience && payload.aud) {
    const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!auds.some((a) => a.includes(audience))) {
      throw new Error(`Token audience mismatch: expected ${audience}`);
    }
  }
  return payload;
}
async function verifyRemotely(token, serverUrl) {
  const res = await fetch(`${serverUrl}/api/session/verify`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.valid) {
    throw new Error(data.error || "Invalid token");
  }
  const parts = token.split(".");
  if (parts.length >= 2) {
    try {
      const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(parts[1])));
      return payload;
    } catch {}
  }
  return {
    iss: serverUrl,
    sub: data.userId,
    aud: [],
    iat: 0,
    exp: data.exp || 0,
    jti: "",
    username: data.username,
    did: data.did,
    eid: {
      authLevel: 2,
      authTime: 0,
      capabilities: { encrypt: true, sign: true, wallet: false },
      recoveryConfigured: false
    }
  };
}
function getAuthLevel(claims) {
  if (!claims.eid)
    return 1;
  const authAge = Math.floor(Date.now() / 1000) - claims.eid.authTime;
  if (authAge < 60)
    return 3;
  if (authAge < 15 * 60)
    return 2;
  return 1;
}
function checkPermission(claims, permission) {
  const currentLevel = getAuthLevel(claims);
  if (currentLevel < permission.minAuthLevel) {
    return {
      allowed: false,
      reason: `Requires auth level ${permission.minAuthLevel} (current: ${currentLevel})`
    };
  }
  if (permission.requiresCapability) {
    const has = claims.eid?.capabilities?.[permission.requiresCapability];
    if (!has) {
      return {
        allowed: false,
        reason: `Requires ${permission.requiresCapability} capability`
      };
    }
  }
  if (permission.maxAgeSeconds) {
    const authAge = Math.floor(Date.now() / 1000) - (claims.eid?.authTime || 0);
    if (authAge > permission.maxAgeSeconds) {
      return {
        allowed: false,
        reason: `Authentication too old (${authAge}s > ${permission.maxAgeSeconds}s)`
      };
    }
  }
  return { allowed: true };
}
function base64urlDecode(str) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0;i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export { verifyEncryptIDToken, getAuthLevel, checkPermission };
