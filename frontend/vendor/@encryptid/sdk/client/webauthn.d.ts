/**
 * EncryptID WebAuthn Module
 *
 * Handles passkey registration, authentication, and PRF extension
 * for key derivation. This is the foundation layer of EncryptID.
 */
import type { EncryptIDCredential, AuthenticationResult, EncryptIDConfig, WebAuthnCapabilities } from '../types/index.js';
export type { EncryptIDCredential, AuthenticationResult, EncryptIDConfig, WebAuthnCapabilities };
/**
 * Abort any pending conditional UI request
 */
export declare function abortConditionalUI(): void;
export declare function bufferToBase64url(buffer: ArrayBuffer): string;
export declare function base64urlToBuffer(base64url: string): ArrayBuffer;
export declare function generateChallenge(): ArrayBuffer;
export declare function generatePRFSalt(purpose: string): Promise<ArrayBuffer>;
export declare function registerPasskey(username: string, displayName: string, config?: Partial<EncryptIDConfig>): Promise<EncryptIDCredential>;
export declare function authenticatePasskey(credentialId?: string, config?: Partial<EncryptIDConfig>): Promise<AuthenticationResult>;
export declare function isConditionalMediationAvailable(): Promise<boolean>;
export declare function startConditionalUI(config?: Partial<EncryptIDConfig>): Promise<AuthenticationResult | null>;
export declare function detectCapabilities(): Promise<WebAuthnCapabilities>;
