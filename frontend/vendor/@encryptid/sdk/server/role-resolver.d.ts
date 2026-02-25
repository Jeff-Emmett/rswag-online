/**
 * EncryptID Space Role Resolver
 *
 * Resolves a user's effective SpaceRole given their space access result
 * and a membership lookup function. This is the bridge between
 * evaluateSpaceAccess() (layer 1: "can they enter?") and
 * hasCapability() (layer 3: "what can they do?").
 */
import type { ResolvedRole, SpaceMembership } from '../types/roles.js';
import type { SpaceAuthResult } from '../types/index.js';
import { SpaceVisibility } from '../types/index.js';
export interface RoleResolverOptions {
    /**
     * Look up membership for a DID in a space.
     * You provide the DB query — works with Prisma, Automerge, raw SQL, etc.
     * Return null if no membership found.
     */
    getMembership: (userDID: string, spaceSlug: string) => Promise<SpaceMembership | null>;
    /** The space's visibility setting */
    visibility: SpaceVisibility;
}
export interface RemoteResolverOptions {
    /** EncryptID server URL (e.g., https://encryptid.jeffemmett.com) */
    serverUrl: string;
    /** The space's visibility setting */
    visibility: SpaceVisibility;
    /** Cache TTL in milliseconds (default: 5 minutes) */
    cacheTtlMs?: number;
}
/**
 * Invalidate the role cache for a specific user/space or the entire cache.
 */
export declare function invalidateRoleCache(userDID?: string, spaceSlug?: string): void;
/**
 * Create a getMembership function that calls the EncryptID server.
 * This is a convenience wrapper for modules that don't have local membership data.
 *
 * @example
 * ```ts
 * const role = await resolveSpaceRole(spaceAuth, slug, {
 *   visibility: 'public',
 *   getMembership: createRemoteMembershipLookup('https://encryptid.jeffemmett.com'),
 * });
 * ```
 */
export declare function createRemoteMembershipLookup(serverUrl: string): (userDID: string, spaceSlug: string) => Promise<SpaceMembership | null>;
/**
 * Resolve a user's effective SpaceRole in a space.
 *
 * Decision flow:
 * 1. Owner → ADMIN (always)
 * 2. Has explicit membership → membership.role
 * 3. No membership, apply defaults based on visibility:
 *    - PUBLIC: anonymous & authenticated → PARTICIPANT
 *    - PUBLIC_READ: anonymous → VIEWER, authenticated → PARTICIPANT
 *    - AUTHENTICATED: → VIEWER (must have membership for more)
 *    - MEMBERS_ONLY: should not reach here (denied at space access layer)
 *
 * @param spaceAuth - Result from evaluateSpaceAccess()
 * @param spaceSlug - The space identifier
 * @param options - Membership lookup and visibility config
 *
 * @example
 * ```ts
 * const spaceAuth = await evaluateSpaceAccess(slug, token, method, opts);
 * if (!spaceAuth.allowed) return deny();
 *
 * const { role, source } = await resolveSpaceRole(spaceAuth, slug, {
 *   visibility: space.visibility,
 *   getMembership: (did, slug) => db.membership.findUnique({ where: { did_slug: { did, slug } } }),
 * });
 *
 * if (hasCapability(role, 'create_proposal', RVOTE_PERMISSIONS)) { ... }
 * ```
 */
export declare function resolveSpaceRole(spaceAuth: SpaceAuthResult, spaceSlug: string, options: RoleResolverOptions): Promise<ResolvedRole>;
/**
 * Resolve a user's SpaceRole by querying the EncryptID server.
 *
 * This is the recommended function for modules that don't maintain
 * their own membership table. It:
 * 1. Checks the in-memory cache (5-min TTL)
 * 2. If miss, queries EncryptID server for membership
 * 3. Falls back to visibility-based defaults on network error
 *
 * @example
 * ```ts
 * const { role, source } = await resolveSpaceRoleRemote(spaceAuth, slug, {
 *   serverUrl: 'https://encryptid.jeffemmett.com',
 *   visibility: space.visibility,
 * });
 * ```
 */
export declare function resolveSpaceRoleRemote(spaceAuth: SpaceAuthResult, spaceSlug: string, options: RemoteResolverOptions): Promise<ResolvedRole>;
