/**
 * @encryptid/sdk — Self-Sovereign Identity SDK
 *
 * WebAuthn passkey authentication with derived keys, social recovery,
 * and cross-app SSO for the r-ecosystem.
 */
export type { EncryptIDCredential, AuthenticationResult, EncryptIDConfig, WebAuthnCapabilities, DerivedKeys, EncryptedData, SignedData, EncryptIDClaims, SessionState, OperationPermission, Guardian, RecoveryConfig, RecoveryRequest, RegistrationStartResponse, RegistrationCompleteResponse, AuthStartResponse, AuthCompleteResponse, SessionVerifyResponse, EmailRecoverySetResponse, EmailRecoveryRequestResponse, EmailRecoveryVerifyResponse, } from './types/index.js';
export { AuthLevel, GuardianType } from './types/index.js';
export { EncryptIDClient } from './client/api-client.js';
export { registerPasskey, authenticatePasskey, startConditionalUI, detectCapabilities, bufferToBase64url, base64urlToBuffer, } from './client/webauthn.js';
export { EncryptIDKeyManager, getKeyManager, signEthHash } from './client/key-derivation.js';
export { SessionManager, getSessionManager, OPERATION_PERMISSIONS } from './client/session.js';
export { RecoveryManager, getRecoveryManager, getGuardianTypeInfo } from './client/recovery.js';
export declare const VERSION = "0.1.0";
export declare const SPEC_VERSION = "2026-02";
