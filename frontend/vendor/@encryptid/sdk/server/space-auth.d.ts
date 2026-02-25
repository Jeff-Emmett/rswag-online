/**
 * EncryptID Space Auth Guard
 *
 * Framework-agnostic space-aware authentication.
 * Evaluates whether a request should be allowed based on:
 * 1. Space visibility configuration
 * 2. Request method (GET/HEAD/OPTIONS = read, others = write)
 * 3. EncryptID session (if present)
 */
import { type VerifyOptions } from './jwt-verify.js';
import { SpaceVisibility } from '../types/index.js';
import type { SpaceAuthConfig, SpaceAuthResult } from '../types/index.js';
export { SpaceVisibility };
export type { SpaceAuthConfig, SpaceAuthResult };
export interface SpaceAuthOptions extends VerifyOptions {
    /** Resolve a space slug to its auth config. You provide the DB/store query. */
    getSpaceConfig: (spaceSlug: string) => Promise<SpaceAuthConfig | null>;
}
/**
 * Core space auth evaluation — framework-agnostic.
 *
 * Apps call this with the space slug, the extracted token (or null),
 * the HTTP method, and a callback to look up the space's config.
 */
export declare function evaluateSpaceAccess(spaceSlug: string, token: string | null, method: string, options: SpaceAuthOptions): Promise<SpaceAuthResult>;
/**
 * Extract EncryptID token from request headers or cookies.
 * Works with both the standard Headers API (fetch/Hono/Next.js) and
 * Express-style header objects.
 */
export declare function extractToken(headers: {
    get?: (name: string) => string | null | undefined;
    authorization?: string;
    cookie?: string;
}): string | null;
