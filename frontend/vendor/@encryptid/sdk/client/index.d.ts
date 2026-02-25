/**
 * @encryptid/sdk/client — Browser-safe client module
 */
export { registerPasskey, authenticatePasskey, startConditionalUI, abortConditionalUI, isConditionalMediationAvailable, detectCapabilities, bufferToBase64url, base64urlToBuffer, generateChallenge, } from './webauthn.js';
export type { EncryptIDCredential, AuthenticationResult, EncryptIDConfig, WebAuthnCapabilities } from './webauthn.js';
export { EncryptIDKeyManager, getKeyManager, resetKeyManager, encryptData, decryptData, decryptDataAsString, signData, verifySignature, wrapKeyForRecipient, unwrapSharedKey, } from './key-derivation.js';
export type { DerivedKeys, EncryptedData, SignedData } from './key-derivation.js';
export { SessionManager, getSessionManager, AuthLevel, OPERATION_PERMISSIONS, } from './session.js';
export type { EncryptIDClaims, SessionState, OperationPermission } from './session.js';
export { RecoveryManager, getRecoveryManager, GuardianType, getGuardianTypeInfo, } from './recovery.js';
export type { Guardian, RecoveryConfig, RecoveryRequest } from './recovery.js';
export { EncryptIDClient } from './api-client.js';
export { shareTokenAcrossModules, clearTokenAcrossModules, initTokenRelayListener, getStoredToken, requestTokenFromDomain, MODULE_DOMAINS, } from './token-relay.js';
