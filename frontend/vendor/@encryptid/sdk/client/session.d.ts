/**
 * EncryptID Session Management
 *
 * Handles session tokens, cross-app SSO, and authentication levels.
 */
import type { AuthenticationResult, EncryptIDClaims, SessionState, OperationPermission } from '../types/index.js';
import { AuthLevel } from '../types/index.js';
export { AuthLevel };
export type { EncryptIDClaims, SessionState, OperationPermission };
export declare const OPERATION_PERMISSIONS: Record<string, OperationPermission>;
export declare class SessionManager {
    private session;
    private refreshTimer;
    constructor();
    createSession(authResult: AuthenticationResult, did: string, capabilities: EncryptIDClaims['eid']['capabilities'], walletAddress?: string, username?: string): Promise<SessionState>;
    getSession(): SessionState | null;
    getDID(): string | null;
    getAccessToken(): string | null;
    getAuthLevel(): AuthLevel;
    canPerform(operation: string): {
        allowed: boolean;
        reason?: string;
    };
    requiresFreshAuth(operation: string): boolean;
    upgradeAuthLevel(level?: AuthLevel): void;
    clearSession(): void;
    isValid(): boolean;
    private createUnsignedToken;
    private createRefreshToken;
    private persistSession;
    private restoreSession;
    private scheduleRefresh;
    private refreshTokens;
}
export declare function getSessionManager(): SessionManager;
