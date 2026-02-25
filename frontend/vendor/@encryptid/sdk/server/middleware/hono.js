import {
  evaluateSpaceAccess,
  extractToken
} from "../../index-j6kh1974.js";
import"../../index-5c1t4ftn.js";
import {
  verifyEncryptIDToken
} from "../../index-stg63j73.js";

// src/server/middleware/hono.ts
function encryptIDAuth(options = {}) {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Missing EncryptID token" }, 401);
    }
    const token = authHeader.slice(7);
    try {
      const claims = await verifyEncryptIDToken(token, options);
      c.set("encryptid", claims);
      await next();
    } catch (err) {
      return c.json({ error: err.message || "Invalid token" }, 401);
    }
  };
}
function encryptIDOptional(options = {}) {
  return async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const claims = await verifyEncryptIDToken(authHeader.slice(7), options);
        c.set("encryptid", claims);
      } catch {}
    }
    await next();
  };
}
function encryptIDSpaceAuth(config) {
  const { slugParam = "slug", slugQuery = "space", ...options } = config;
  return async (c, next) => {
    const spaceSlug = c.req.param(slugParam) || c.req.query(slugQuery) || "";
    const token = extractToken(c.req.raw.headers);
    const result = await evaluateSpaceAccess(spaceSlug, token, c.req.method, options);
    if (!result.allowed) {
      return c.json({ error: result.reason }, result.claims ? 403 : 401);
    }
    if (result.claims) {
      c.set("encryptid", result.claims);
    }
    c.set("spaceAuth", result);
    await next();
  };
}
export {
  encryptIDSpaceAuth,
  encryptIDOptional,
  encryptIDAuth
};
