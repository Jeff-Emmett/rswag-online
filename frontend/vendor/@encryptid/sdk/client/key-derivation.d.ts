/**
 * EncryptID Key Derivation Module
 *
 * Derives application-specific cryptographic keys from WebAuthn PRF output
 * or passphrase fallback. Layer 2 of the EncryptID architecture.
 */
import type { DerivedKeys, EncryptedData, SignedData } from '../types/index.js';
export type { DerivedKeys, EncryptedData, SignedData };
export declare class EncryptIDKeyManager {
    private masterKey;
    private derivedKeys;
    private fromPRF;
    initFromPRF(prfOutput: ArrayBuffer): Promise<void>;
    initFromPassphrase(passphrase: string, salt: Uint8Array): Promise<void>;
    static generateSalt(): Uint8Array;
    isInitialized(): boolean;
    getKeys(): Promise<DerivedKeys>;
    private deriveEncryptionKey;
    private deriveSigningKeyPair;
    /**
     * Derive deterministic secp256k1 keys from the master key via HKDF.
     * This gives every EncryptID identity an Ethereum-compatible wallet address,
     * enabling them to act as Gnosis Safe owners for multi-sig approvals.
     */
    private deriveEthereumKeys;
    private deriveDIDSeed;
    private generateDID;
    clear(): void;
}
export declare function encryptData(key: CryptoKey, data: ArrayBuffer | Uint8Array | string): Promise<EncryptedData>;
export declare function decryptData(key: CryptoKey, encrypted: EncryptedData): Promise<ArrayBuffer>;
export declare function decryptDataAsString(key: CryptoKey, encrypted: EncryptedData): Promise<string>;
export declare function signData(keyPair: CryptoKeyPair, data: ArrayBuffer | Uint8Array | string): Promise<SignedData>;
export declare function verifySignature(signed: SignedData): Promise<boolean>;
export declare function wrapKeyForRecipient(keyToWrap: CryptoKey, recipientPublicKey: CryptoKey): Promise<ArrayBuffer>;
export declare function unwrapSharedKey(wrappedKey: ArrayBuffer, privateKey: CryptoKey): Promise<CryptoKey>;
/**
 * Sign an Ethereum-compatible message hash with a secp256k1 private key.
 * Returns { r, s, v } components for Safe transaction signing.
 *
 * @param hash - 32-byte message hash (e.g. keccak256 of the message)
 * @param privateKey - 32-byte secp256k1 private key
 */
export declare function signEthHash(hash: Uint8Array, privateKey: Uint8Array): {
    r: string;
    s: string;
    v: number;
    signature: Uint8Array;
};
export declare function getKeyManager(): EncryptIDKeyManager;
export declare function resetKeyManager(): void;
