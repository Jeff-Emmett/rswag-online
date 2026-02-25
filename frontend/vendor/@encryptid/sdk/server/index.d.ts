/**
 * @encryptid/sdk/server — Server-side module
 */
export { verifyEncryptIDToken, getAuthLevel, checkPermission, } from './jwt-verify.js';
export type { VerifyOptions } from './jwt-verify.js';
export { evaluateSpaceAccess, extractToken, SpaceVisibility, } from './space-auth.js';
export type { SpaceAuthConfig, SpaceAuthResult, SpaceAuthOptions } from './space-auth.js';
export { authenticateWSUpgrade } from './ws-auth.js';
export { resolveSpaceRole, resolveSpaceRoleRemote, createRemoteMembershipLookup, invalidateRoleCache } from './role-resolver.js';
export type { RoleResolverOptions, RemoteResolverOptions } from './role-resolver.js';
