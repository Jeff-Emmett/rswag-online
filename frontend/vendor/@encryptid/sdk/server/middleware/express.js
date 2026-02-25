import {
  evaluateSpaceAccess,
  extractToken
} from "../../index-j6kh1974.js";
import"../../index-5c1t4ftn.js";
import {
  verifyEncryptIDToken
} from "../../index-stg63j73.js";

// src/server/middleware/express.ts
function encryptIDAuth(options = {}) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing EncryptID token" });
      return;
    }
    const token = authHeader.slice(7);
    try {
      req.encryptid = await verifyEncryptIDToken(token, options);
      next();
    } catch (err) {
      res.status(401).json({ error: err.message || "Invalid token" });
    }
  };
}
function encryptIDOptional(options = {}) {
  return async (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      try {
        req.encryptid = await verifyEncryptIDToken(authHeader.slice(7), options);
      } catch {}
    }
    next();
  };
}
function encryptIDSpaceAuth(config) {
  const { getSlug, ...options } = config;
  return async (req, res, next) => {
    const slug = getSlug ? getSlug(req) : req.params?.slug || "";
    const token = extractToken(req.headers);
    const result = await evaluateSpaceAccess(slug, token, req.method, options);
    if (!result.allowed) {
      res.status(result.claims ? 403 : 401).json({ error: result.reason });
      return;
    }
    if (result.claims) {
      req.encryptid = result.claims;
    }
    req.spaceAuth = result;
    next();
  };
}
export {
  encryptIDSpaceAuth,
  encryptIDOptional,
  encryptIDAuth
};
