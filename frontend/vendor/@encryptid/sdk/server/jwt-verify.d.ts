/**
 * EncryptID JWT Verification
 *
 * Server-side utilities for verifying EncryptID JWT tokens.
 * Can verify locally with shared secret or by calling the EncryptID server.
 */
import type { EncryptIDClaims, OperationPermission } from '../types/index.js';
export interface VerifyOptions {
    /** JWT secret for local verification (HS256) */
    secret?: string;
    /** EncryptID server URL for remote verification */
    serverUrl?: string;
    /** Expected audience (your app's origin) */
    audience?: string;
    /** Clock tolerance in seconds for expiration check */
    clockTolerance?: number;
}
/**
 * Verify an EncryptID JWT token
 *
 * If `secret` is provided, verifies locally using HMAC-SHA256.
 * Otherwise, calls the EncryptID server's /api/session/verify endpoint.
 */
export declare function verifyEncryptIDToken(token: string, options?: VerifyOptions): Promise<EncryptIDClaims>;
/**
 * Extract the auth level from claims
 */
export declare function getAuthLevel(claims: EncryptIDClaims): number;
/**
 * Check if claims satisfy an operation permission
 */
export declare function checkPermission(claims: EncryptIDClaims, permission: OperationPermission): {
    allowed: boolean;
    reason?: string;
};
