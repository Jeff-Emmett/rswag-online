import {
  evaluateSpaceAccess,
  extractToken
} from "../../index-j6kh1974.js";
import"../../index-5c1t4ftn.js";
import {
  verifyEncryptIDToken
} from "../../index-stg63j73.js";

// src/server/middleware/nextjs.ts
async function getEncryptIDSession(request, options = {}) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      return await verifyEncryptIDToken(authHeader.slice(7), options);
    } catch {
      return null;
    }
  }
  const cookieHeader = request.headers.get("Cookie") || "";
  const tokenMatch = cookieHeader.match(/encryptid_token=([^;]+)/);
  if (tokenMatch) {
    try {
      return await verifyEncryptIDToken(tokenMatch[1], options);
    } catch {
      return null;
    }
  }
  return null;
}
function withEncryptID(handler, options = {}) {
  return async (request) => {
    const session = await getEncryptIDSession(request, options);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return handler(request, session);
  };
}
function createEncryptIDMiddleware(config = {}) {
  const { publicPaths = [], loginUrl = null, ...verifyOptions } = config;
  return async (request) => {
    const url = new URL(request.url);
    if (publicPaths.some((p) => url.pathname.startsWith(p))) {
      return null;
    }
    const session = await getEncryptIDSession(request, verifyOptions);
    if (!session) {
      if (loginUrl) {
        return Response.redirect(new URL(loginUrl, request.url));
      }
      return new Response("Unauthorized", { status: 401 });
    }
    return null;
  };
}
async function checkSpaceAccess(request, spaceSlug, options) {
  const token = extractToken(request.headers);
  return evaluateSpaceAccess(spaceSlug, token, request.method, options);
}
function withSpaceAuth(handler, getSlug, options) {
  return async (request) => {
    const slug = getSlug(request);
    const result = await checkSpaceAccess(request, slug, options);
    if (!result.allowed) {
      return new Response(JSON.stringify({ error: result.reason }), {
        status: result.claims ? 403 : 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    return handler(request, result, slug);
  };
}
export {
  withSpaceAuth,
  withEncryptID,
  getEncryptIDSession,
  createEncryptIDMiddleware,
  checkSpaceAccess
};
