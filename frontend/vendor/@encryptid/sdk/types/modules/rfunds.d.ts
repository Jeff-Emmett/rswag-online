/**
 * rFunds — Funding Flows & Treasury
 *
 * Permission capabilities for the rFunds funding/treasury module.
 */
import type { ModulePermissionMap } from '../module-permissions.js';
export type RFundsCapability = 'view_flows' | 'create_flow' | 'contribute_funds' | 'moderate_flows' | 'configure_treasury';
export declare const RFUNDS_PERMISSIONS: ModulePermissionMap<RFundsCapability>;
