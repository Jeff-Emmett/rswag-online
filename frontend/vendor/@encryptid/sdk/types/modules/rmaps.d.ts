/**
 * rMaps — Spatial Intelligence
 *
 * Permission capabilities for the rMaps collaborative mapping module.
 */
import type { ModulePermissionMap } from '../module-permissions.js';
export type RMapsCapability = 'view_map' | 'add_markers' | 'share_location' | 'moderate_markers' | 'configure_map';
export declare const RMAPS_PERMISSIONS: ModulePermissionMap<RMapsCapability>;
