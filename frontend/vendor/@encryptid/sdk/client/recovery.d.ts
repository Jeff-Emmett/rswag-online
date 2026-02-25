/**
 * EncryptID Social Recovery Module
 *
 * Guardian-based account recovery with NO SEED PHRASES.
 */
import type { Guardian, RecoveryConfig, RecoveryRequest } from '../types/index.js';
import { GuardianType } from '../types/index.js';
export { GuardianType };
export type { Guardian, RecoveryConfig, RecoveryRequest };
export declare class RecoveryManager {
    private config;
    private activeRequest;
    constructor();
    initializeRecovery(threshold?: number): Promise<RecoveryConfig>;
    addGuardian(guardian: Omit<Guardian, 'id' | 'addedAt'>): Promise<Guardian>;
    removeGuardian(guardianId: string): Promise<void>;
    setThreshold(threshold: number): Promise<void>;
    setDelay(delaySeconds: number): Promise<void>;
    getConfig(): RecoveryConfig | null;
    isConfigured(): boolean;
    verifyGuardian(guardianId: string): Promise<boolean>;
    initiateRecovery(newCredentialId: string): Promise<RecoveryRequest>;
    approveRecovery(guardianId: string, signature: string): Promise<RecoveryRequest>;
    cancelRecovery(): Promise<void>;
    completeRecovery(): Promise<void>;
    getActiveRequest(): RecoveryRequest | null;
    private hashGuardianList;
    private saveConfig;
    private loadConfig;
}
export declare function getRecoveryManager(): RecoveryManager;
export declare function getGuardianTypeInfo(type: GuardianType): {
    name: string;
    description: string;
    icon: string;
    setupInstructions: string;
};
