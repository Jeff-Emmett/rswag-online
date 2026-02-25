/**
 * EncryptID API Client
 *
 * HTTP client for communicating with the EncryptID server.
 * Handles registration, authentication, session management.
 */
import type { RegistrationStartResponse, RegistrationCompleteResponse, AuthStartResponse, AuthCompleteResponse, SessionVerifyResponse, EmailRecoverySetResponse, EmailRecoveryRequestResponse, EmailRecoveryVerifyResponse } from '../types/index.js';
export declare class EncryptIDClient {
    private serverUrl;
    constructor(serverUrl?: string);
    /**
     * Start registration — get challenge and options from server
     */
    registerStart(username: string, displayName?: string): Promise<RegistrationStartResponse>;
    /**
     * Complete registration — send credential to server
     */
    registerComplete(challenge: string, credential: PublicKeyCredential, userId: string, username: string): Promise<RegistrationCompleteResponse>;
    /**
     * Start authentication — get challenge from server
     */
    authStart(credentialId?: string): Promise<AuthStartResponse>;
    /**
     * Complete authentication — send assertion to server
     */
    authComplete(challenge: string, credential: PublicKeyCredential): Promise<AuthCompleteResponse>;
    /**
     * Verify a session token
     */
    verifySession(token: string): Promise<SessionVerifyResponse>;
    /**
     * Refresh a session token
     */
    refreshToken(token: string): Promise<{
        token: string;
    }>;
    /**
     * List user's credentials
     */
    listCredentials(token: string): Promise<{
        credentials: any[];
    }>;
    /**
     * Set recovery email for the authenticated user
     */
    setRecoveryEmail(token: string, email: string): Promise<EmailRecoverySetResponse>;
    /**
     * Request account recovery via email
     */
    requestEmailRecovery(email: string): Promise<EmailRecoveryRequestResponse>;
    /**
     * Verify a recovery token and get a temporary session
     */
    verifyRecoveryToken(recoveryToken: string): Promise<EmailRecoveryVerifyResponse>;
    /**
     * Full registration flow: server challenge → WebAuthn create → server verify
     */
    register(username: string, displayName?: string, config?: {
        rpId?: string;
    }): Promise<RegistrationCompleteResponse>;
    /**
     * Full authentication flow: server challenge → WebAuthn get → server verify
     */
    authenticate(credentialId?: string, config?: {
        rpId?: string;
    }): Promise<AuthCompleteResponse & {
        prfOutput?: ArrayBuffer;
    }>;
}
