/**
 * EncryptID SDK — Space Role System
 *
 * Defines the unified role hierarchy for the r*.online ecosystem.
 * Spaces have visibility (who can enter) and roles (what you can do).
 */
/**
 * Ecosystem-wide role within a space.
 * These are the ONLY roles stored at the space level.
 * Modules interpret these into module-specific capabilities.
 */
export declare enum SpaceRole {
    /** Can view public content in the space */
    VIEWER = "viewer",
    /** Can participate: create, edit own content */
    PARTICIPANT = "participant",
    /** Can moderate: edit/delete others' content, manage participants */
    MODERATOR = "moderator",
    /** Full control: configure space, manage roles, delete space */
    ADMIN = "admin"
}
/**
 * Ordered precedence (higher number = more powerful).
 * Used by hasCapability() and role comparison helpers.
 */
export declare const SPACE_ROLE_LEVEL: Record<SpaceRole, number>;
/**
 * Check if a role meets or exceeds a required minimum role.
 */
export declare function roleAtLeast(userRole: SpaceRole, requiredRole: SpaceRole): boolean;
/**
 * Space membership record.
 * Each app stores memberships in its own DB (Prisma, Automerge, etc.)
 * but the shape is consistent across the ecosystem.
 */
export interface SpaceMembership {
    /** User's DID (from EncryptID claims.sub) */
    userDID: string;
    /** Space identifier (slug) */
    spaceSlug: string;
    /** Role in this space */
    role: SpaceRole;
    /** When the membership was granted (epoch ms) */
    joinedAt: number;
    /** DID of user who granted this membership (null = self-join or owner) */
    grantedBy?: string;
}
/**
 * Result of resolving a user's effective role in a space.
 * Includes the source for debugging and audit.
 */
export interface ResolvedRole {
    /** The effective role */
    role: SpaceRole;
    /** How the role was determined */
    source: 'membership' | 'owner' | 'default' | 'anonymous';
}
