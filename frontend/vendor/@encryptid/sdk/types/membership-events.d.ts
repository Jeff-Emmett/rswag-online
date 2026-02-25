/**
 * EncryptID SDK — Space Membership Event Types
 *
 * Events emitted when membership changes in a space.
 * Used by the membership sync system to keep all r*.online
 * modules consistent when a user's role changes.
 */
import type { SpaceRole } from './roles.js';
export type SpaceMembershipEventType = 'member.joined' | 'member.left' | 'member.role_changed';
/**
 * Emitted by EncryptID server when space membership changes.
 * Modules can subscribe to these events to invalidate role caches.
 */
export interface SpaceMembershipEvent {
    type: SpaceMembershipEventType;
    /** Space identifier */
    spaceSlug: string;
    /** DID of the user whose membership changed */
    userDID: string;
    /** New role (undefined for member.left) */
    role?: SpaceRole;
    /** Previous role (undefined for member.joined) */
    previousRole?: SpaceRole;
    /** DID of user who initiated the change */
    changedBy?: string;
    /** Unix timestamp (ms) */
    timestamp: number;
}
export interface AddMemberRequest {
    /** DID of user to add */
    userDID: string;
    /** Role to grant */
    role: SpaceRole;
}
export interface UpdateMemberRequest {
    /** New role */
    role: SpaceRole;
}
export interface MemberResponse {
    userDID: string;
    spaceSlug: string;
    role: SpaceRole;
    joinedAt: number;
    grantedBy?: string;
}
export interface MemberListResponse {
    members: MemberResponse[];
    total: number;
}
