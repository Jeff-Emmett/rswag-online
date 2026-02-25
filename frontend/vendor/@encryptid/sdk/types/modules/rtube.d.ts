/**
 * rTube — Video Hosting & Streaming
 *
 * Permission capabilities for the rTube video module.
 */
import type { ModulePermissionMap } from '../module-permissions.js';
export type RTubeCapability = 'view_videos' | 'upload_video' | 'start_stream' | 'moderate_videos' | 'configure_channel';
export declare const RTUBE_PERMISSIONS: ModulePermissionMap<RTubeCapability>;
