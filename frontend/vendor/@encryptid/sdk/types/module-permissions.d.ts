/**
 * EncryptID SDK — Module Permission Maps
 *
 * Each r*.online module declares a static mapping from capabilities
 * to the minimum SpaceRole required. This is the central abstraction
 * for permission inheritance across the ecosystem.
 */
import { SpaceRole } from './roles.js';
import type { AppName } from './index.js';
/**
 * A module's permission declaration.
 * Maps each capability string to the minimum SpaceRole required.
 *
 * @template TCapability - Union of capability string literals for this module
 */
export interface ModulePermissionMap<TCapability extends string = string> {
    /** Module identifier (matches AppName) */
    module: AppName;
    /** Human-readable module name */
    displayName: string;
    /**
     * For each capability, the minimum SpaceRole required.
     * If a capability is not listed, it requires ADMIN by default.
     */
    capabilities: Record<TCapability, SpaceRole>;
}
/**
 * Check if a user's SpaceRole satisfies a module capability requirement.
 *
 * @param userRole - The user's resolved SpaceRole in the space
 * @param capability - The capability to check
 * @param permMap - The module's permission map
 * @returns true if the user's role meets or exceeds the minimum for this capability
 *
 * @example
 * ```ts
 * import { hasCapability } from '@encryptid/sdk';
 * import { RVOTE_PERMISSIONS } from '@encryptid/sdk/types/modules';
 *
 * if (hasCapability(userRole, 'create_proposal', RVOTE_PERMISSIONS)) {
 *   // user can create proposals
 * }
 * ```
 */
export declare function hasCapability<T extends string>(userRole: SpaceRole, capability: T, permMap: ModulePermissionMap<T>): boolean;
/**
 * Get all capabilities a role has access to in a module.
 *
 * @param userRole - The user's resolved SpaceRole
 * @param permMap - The module's permission map
 * @returns Array of capability strings the user has access to
 */
export declare function getCapabilities<T extends string>(userRole: SpaceRole, permMap: ModulePermissionMap<T>): T[];
