/**
 * EncryptID Hono Middleware
 *
 * Authentication middleware for Hono web framework.
 */
import type { MiddlewareHandler } from 'hono';
import { type VerifyOptions } from '../jwt-verify.js';
import { type SpaceAuthOptions } from '../space-auth.js';
import type { EncryptIDClaims, SpaceAuthResult } from '../../types/index.js';
import type { ResolvedRole } from '../../types/roles.js';
declare module 'hono' {
    interface ContextVariableMap {
        encryptid: EncryptIDClaims;
        spaceAuth: SpaceAuthResult;
        spaceRole: ResolvedRole;
    }
}
/**
 * Hono middleware that verifies EncryptID JWT tokens
 *
 * Usage:
 * ```ts
 * import { Hono } from 'hono';
 * import { encryptIDAuth } from '@encryptid/sdk/server/hono';
 *
 * const app = new Hono();
 *
 * // Protect all /api routes
 * app.use('/api/*', encryptIDAuth());
 *
 * app.get('/api/profile', (c) => {
 *   const session = c.get('encryptid');
 *   return c.json({ did: session.did, sub: session.sub });
 * });
 * ```
 */
export declare function encryptIDAuth(options?: VerifyOptions): MiddlewareHandler;
/**
 * Optional auth — sets session if token present, continues either way
 */
export declare function encryptIDOptional(options?: VerifyOptions): MiddlewareHandler;
export interface EncryptIDSpaceAuthConfig extends SpaceAuthOptions {
    /** Route param name for the space slug (default: 'slug') */
    slugParam?: string;
    /** Query param fallback for the space slug (default: 'space') */
    slugQuery?: string;
}
/**
 * Hono middleware for space-aware auth.
 *
 * Reads the space slug from route params or query, evaluates access
 * based on visibility, and sets `c.var.spaceAuth` with the result.
 *
 * Usage:
 * ```ts
 * app.use('/api/communities/:slug/*', encryptIDSpaceAuth({
 *   getSpaceConfig: async (slug) => db.getCommunity(slug),
 * }));
 *
 * app.get('/api/communities/:slug', (c) => {
 *   const auth = c.get('spaceAuth');
 *   if (auth.readOnly) { // public_read, unauthenticated
 *     return c.json({ ...community, canEdit: false });
 *   }
 * });
 * ```
 */
export declare function encryptIDSpaceAuth(config: EncryptIDSpaceAuthConfig): MiddlewareHandler;
export interface EncryptIDSpaceRoleConfig extends EncryptIDSpaceAuthConfig {
    /** Look up membership for a DID in a space. You provide the DB query. */
    getMembership: (userDID: string, spaceSlug: string) => Promise<import('../../types/roles.js').SpaceMembership | null>;
    /** Resolve visibility for a space slug (if not in SpaceAuthConfig). Defaults to using getSpaceConfig. */
    getVisibility?: (spaceSlug: string) => Promise<import('../../types/index.js').SpaceVisibility>;
}
/**
 * Combined space auth + role resolution middleware for Hono.
 *
 * Sets `c.var.spaceAuth`, `c.var.spaceRole`, and optionally `c.var.encryptid`.
 *
 * Usage:
 * ```ts
 * import { encryptIDSpaceRoleAuth } from '@encryptid/sdk/server/hono';
 * import { hasCapability } from '@encryptid/sdk';
 * import { RVOTE_PERMISSIONS } from '@encryptid/sdk/types/modules';
 *
 * app.use('/api/spaces/:slug/*', encryptIDSpaceRoleAuth({
 *   getSpaceConfig: async (slug) => db.getSpace(slug),
 *   getMembership: async (did, slug) => db.getMembership(did, slug),
 * }));
 *
 * app.post('/api/spaces/:slug/proposals', (c) => {
 *   const { role } = c.get('spaceRole');
 *   if (!hasCapability(role, 'create_proposal', RVOTE_PERMISSIONS)) {
 *     return c.json({ error: 'Insufficient permissions' }, 403);
 *   }
 *   // ...
 * });
 * ```
 */
export declare function encryptIDSpaceRoleAuth(config: EncryptIDSpaceRoleConfig): MiddlewareHandler;
