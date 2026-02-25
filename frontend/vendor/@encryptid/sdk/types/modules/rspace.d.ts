/**
 * rSpace — Canvas/Collaboration Platform
 *
 * Permission capabilities for the rSpace collaborative canvas.
 */
import type { ModulePermissionMap } from '../module-permissions.js';
export type RSpaceCapability = 'view_canvas' | 'add_shapes' | 'edit_own_shapes' | 'edit_any_shape' | 'delete_any_shape' | 'configure_space';
export declare const RSPACE_PERMISSIONS: ModulePermissionMap<RSpaceCapability>;
