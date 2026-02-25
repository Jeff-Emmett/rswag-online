/**
 * rNotes — Collaborative Notebooks
 *
 * Permission capabilities for the rNotes note-taking module.
 * Note: rNotes also has per-notebook CollaboratorRole overrides.
 * Space-level role sets the default; notebook-level can narrow or widen.
 */
import type { ModulePermissionMap } from '../module-permissions.js';
export type RNotesCapability = 'view_notebooks' | 'create_notebook' | 'edit_own_notes' | 'edit_any_notes' | 'manage_notebooks';
export declare const RNOTES_PERMISSIONS: ModulePermissionMap<RNotesCapability>;
