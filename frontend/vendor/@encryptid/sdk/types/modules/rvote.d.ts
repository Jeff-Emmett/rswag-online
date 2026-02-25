/**
 * rVote — Decision Engine
 *
 * Permission capabilities for the rVote voting/governance module.
 */
import type { ModulePermissionMap } from '../module-permissions.js';
export type RVoteCapability = 'view_proposals' | 'create_proposal' | 'cast_vote' | 'moderate_proposals' | 'configure_voting';
export declare const RVOTE_PERMISSIONS: ModulePermissionMap<RVoteCapability>;
