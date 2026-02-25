import {
  verifyEncryptIDToken
} from "./index-stg63j73.js";

// src/server/space-auth.ts
async function evaluateSpaceAccess(spaceSlug, token, method, options) {
  const config = await options.getSpaceConfig(spaceSlug);
  if (!config) {
    return { allowed: false, claims: null, reason: "Space not found", isOwner: false, readOnly: false };
  }
  let claims = null;
  if (token) {
    try {
      claims = await verifyEncryptIDToken(token, options);
    } catch {}
  }
  const isRead = method === "GET" || method === "HEAD" || method === "OPTIONS";
  const isOwner = !!(claims && config.ownerDID && claims.sub === config.ownerDID);
  switch (config.visibility) {
    case "public" /* PUBLIC */:
      return { allowed: true, claims, isOwner, readOnly: false };
    case "public_read" /* PUBLIC_READ */:
      if (isRead) {
        return { allowed: true, claims, isOwner, readOnly: !claims };
      }
      if (!claims) {
        return {
          allowed: false,
          claims: null,
          reason: "Authentication required to modify this space",
          isOwner: false,
          readOnly: true
        };
      }
      return { allowed: true, claims, isOwner, readOnly: false };
    case "authenticated" /* AUTHENTICATED */:
      if (!claims) {
        return { allowed: false, claims: null, reason: "Authentication required", isOwner: false, readOnly: false };
      }
      return { allowed: true, claims, isOwner, readOnly: false };
    case "members_only" /* MEMBERS_ONLY */:
      if (!claims) {
        return { allowed: false, claims: null, reason: "Authentication required", isOwner: false, readOnly: false };
      }
      return { allowed: true, claims, isOwner, readOnly: false };
    default:
      return { allowed: false, claims: null, reason: "Unknown visibility setting", isOwner: false, readOnly: false };
  }
}
function extractToken(headers) {
  if (typeof headers.get === "function") {
    const auth = headers.get("Authorization") || headers.get("authorization");
    if (auth?.startsWith("Bearer "))
      return auth.slice(7);
    const cookie = headers.get("Cookie") || headers.get("cookie") || "";
    const match = cookie.match(/encryptid_token=([^;]+)/);
    if (match)
      return match[1];
  }
  if (typeof headers.authorization === "string") {
    if (headers.authorization.startsWith("Bearer "))
      return headers.authorization.slice(7);
  }
  if (typeof headers.cookie === "string") {
    const match = headers.cookie.match(/encryptid_token=([^;]+)/);
    if (match)
      return match[1];
  }
  return null;
}

export { evaluateSpaceAccess, extractToken };
