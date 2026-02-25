/**
 * EncryptID SDK — Shared Types
 */
export interface EncryptIDCredential {
    credentialId: string;
    publicKey: ArrayBuffer;
    userId: string;
    username: string;
    createdAt: number;
    prfSupported: boolean;
    transports?: AuthenticatorTransport[];
}
export interface AuthenticationResult {
    credentialId: string;
    userId: string;
    prfOutput?: ArrayBuffer;
    signature: ArrayBuffer;
    authenticatorData: ArrayBuffer;
}
export interface EncryptIDConfig {
    rpId: string;
    rpName: string;
    origin: string;
    userVerification: UserVerificationRequirement;
    timeout: number;
}
export interface WebAuthnCapabilities {
    webauthn: boolean;
    platformAuthenticator: boolean;
    conditionalUI: boolean;
    prfExtension: boolean;
}
export interface DerivedKeys {
    encryptionKey: CryptoKey;
    signingKeyPair: CryptoKeyPair;
    didSeed: Uint8Array;
    did: string;
    fromPRF: boolean;
    /** Ethereum-compatible secp256k1 wallet derived from the same master key */
    ethereum?: {
        address: string;
        publicKey: Uint8Array;
        privateKey: Uint8Array;
    };
}
export interface EncryptedData {
    ciphertext: ArrayBuffer;
    iv: Uint8Array;
    tag?: ArrayBuffer;
}
export interface SignedData {
    data: ArrayBuffer;
    signature: ArrayBuffer;
    publicKey: ArrayBuffer;
}
export declare enum AuthLevel {
    BASIC = 1,
    STANDARD = 2,
    ELEVATED = 3,
    CRITICAL = 4
}
export interface EncryptIDClaims {
    iss: string;
    sub: string;
    aud: string[];
    iat: number;
    exp: number;
    jti: string;
    username: string;
    did?: string;
    eid: {
        walletAddress?: string;
        credentialId?: string;
        authLevel: AuthLevel;
        authTime: number;
        capabilities: {
            encrypt: boolean;
            sign: boolean;
            wallet: boolean;
        };
        recoveryConfigured: boolean;
    };
}
export interface SessionState {
    accessToken: string;
    refreshToken: string;
    claims: EncryptIDClaims;
    lastAuthTime: number;
}
export interface OperationPermission {
    minAuthLevel: AuthLevel;
    requiresCapability?: 'encrypt' | 'sign' | 'wallet';
    maxAgeSeconds?: number;
}
export declare enum GuardianType {
    SECONDARY_PASSKEY = "secondary_passkey",
    TRUSTED_CONTACT = "trusted_contact",
    HARDWARE_KEY = "hardware_key",
    INSTITUTIONAL = "institutional",
    TIME_DELAYED_SELF = "time_delayed_self"
}
export interface Guardian {
    id: string;
    type: GuardianType;
    name: string;
    weight: number;
    credentialId?: string;
    contactDID?: string;
    contactEmail?: string;
    serviceUrl?: string;
    delaySeconds?: number;
    addedAt: number;
    lastVerified?: number;
}
export interface RecoveryConfig {
    threshold: number;
    delaySeconds: number;
    guardians: Guardian[];
    guardianListHash: string;
    updatedAt: number;
}
export interface RecoveryRequest {
    id: string;
    accountDID: string;
    newCredentialId: string;
    initiatedAt: number;
    completesAt: number;
    status: 'pending' | 'approved' | 'cancelled' | 'completed';
    approvals: {
        guardianId: string;
        approvedAt: number;
        signature: string;
    }[];
    approvalWeight: number;
}
export interface RegistrationStartResponse {
    options: {
        challenge: string;
        rp: {
            id: string;
            name: string;
        };
        user: {
            id: string;
            name: string;
            displayName: string;
        };
        pubKeyCredParams: {
            alg: number;
            type: string;
        }[];
        authenticatorSelection: Record<string, unknown>;
        timeout: number;
        attestation: string;
        extensions?: Record<string, unknown>;
    };
    userId: string;
}
export interface RegistrationCompleteResponse {
    success: boolean;
    userId: string;
    token: string;
    did: string;
}
export interface AuthStartResponse {
    options: {
        challenge: string;
        rpId: string;
        userVerification: string;
        timeout: number;
        allowCredentials?: {
            type: string;
            id: string;
            transports?: string[];
        }[];
    };
}
export interface AuthCompleteResponse {
    success: boolean;
    userId: string;
    username: string;
    token: string;
    did: string;
}
export interface SessionVerifyResponse {
    valid: boolean;
    userId?: string;
    username?: string;
    did?: string;
    exp?: number;
    error?: string;
}
export interface EmailRecoverySetResponse {
    success: boolean;
    email: string;
}
export interface EmailRecoveryRequestResponse {
    success: boolean;
    message: string;
}
export interface EmailRecoveryVerifyResponse {
    success: boolean;
    token: string;
    userId: string;
    username: string;
    did: string;
    message: string;
}
export declare enum SpaceVisibility {
    /** Anyone can view and interact, no auth required */
    PUBLIC = "public",
    /** Anyone can view, auth required for write/interact */
    PUBLIC_READ = "public_read",
    /** Auth required for any access */
    AUTHENTICATED = "authenticated",
    /** Only space members can access (app must check membership separately) */
    MEMBERS_ONLY = "members_only"
}
export type AppName = 'rspace' | 'rvote' | 'rfiles' | 'rmaps' | 'rwallet' | 'rfunds' | 'rnotes' | 'rtrips' | 'rnetwork' | 'rcart' | 'rmail' | 'rcal' | 'rtube' | 'rstack' | 'canvas';
export { SpaceRole, SPACE_ROLE_LEVEL, roleAtLeast } from './roles.js';
export type { SpaceMembership, ResolvedRole } from './roles.js';
export { hasCapability, getCapabilities } from './module-permissions.js';
export type { ModulePermissionMap } from './module-permissions.js';
export type { SpaceMembershipEvent, SpaceMembershipEventType, AddMemberRequest, UpdateMemberRequest, MemberResponse, MemberListResponse, } from './membership-events.js';
export interface SpaceAuthConfig {
    /** Space identifier (slug) */
    spaceSlug: string;
    /** Who can see/interact with this space */
    visibility: SpaceVisibility;
    /** DID of the space creator/owner */
    ownerDID?: string;
    /** App this space belongs to */
    app: AppName;
}
export interface SpaceAuthResult {
    /** Whether access is allowed */
    allowed: boolean;
    /** The authenticated user's claims (null if unauthenticated public access) */
    claims: EncryptIDClaims | null;
    /** Why access was denied */
    reason?: string;
    /** Whether the user is the space owner */
    isOwner: boolean;
    /** Whether this is read-only access (public_read with no auth) */
    readOnly: boolean;
}
