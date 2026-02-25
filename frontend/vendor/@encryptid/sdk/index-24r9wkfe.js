import {
  bufferToBase64url
} from "./index-2cp5044h.js";
import {
  AuthLevel
} from "./index-5c1t4ftn.js";

// src/client/key-derivation.ts
class EncryptIDKeyManager {
  masterKey = null;
  derivedKeys = null;
  fromPRF = false;
  async initFromPRF(prfOutput) {
    this.masterKey = await crypto.subtle.importKey("raw", prfOutput, { name: "HKDF" }, false, ["deriveKey", "deriveBits"]);
    this.fromPRF = true;
    this.derivedKeys = null;
  }
  async initFromPassphrase(passphrase, salt) {
    const encoder = new TextEncoder;
    const passphraseKey = await crypto.subtle.importKey("raw", encoder.encode(passphrase), { name: "PBKDF2" }, false, ["deriveBits"]);
    const masterKeyMaterial = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" }, passphraseKey, 256);
    this.masterKey = await crypto.subtle.importKey("raw", masterKeyMaterial, { name: "HKDF" }, false, ["deriveKey", "deriveBits"]);
    this.fromPRF = false;
    this.derivedKeys = null;
  }
  static generateSalt() {
    return crypto.getRandomValues(new Uint8Array(32));
  }
  isInitialized() {
    return this.masterKey !== null;
  }
  async getKeys() {
    if (!this.masterKey)
      throw new Error("Key manager not initialized");
    if (this.derivedKeys)
      return this.derivedKeys;
    const [encryptionKey, signingKeyPair, didSeed] = await Promise.all([
      this.deriveEncryptionKey(),
      this.deriveSigningKeyPair(),
      this.deriveDIDSeed()
    ]);
    const did = await this.generateDID(didSeed);
    this.derivedKeys = { encryptionKey, signingKeyPair, didSeed, did, fromPRF: this.fromPRF };
    return this.derivedKeys;
  }
  async deriveEncryptionKey() {
    const encoder = new TextEncoder;
    return crypto.subtle.deriveKey({ name: "HKDF", hash: "SHA-256", salt: encoder.encode("encryptid-encryption-key-v1"), info: encoder.encode("AES-256-GCM") }, this.masterKey, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt", "wrapKey", "unwrapKey"]);
  }
  async deriveSigningKeyPair() {
    return crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, false, ["sign", "verify"]);
  }
  async deriveDIDSeed() {
    const encoder = new TextEncoder;
    const seed = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: encoder.encode("encryptid-did-key-v1"), info: encoder.encode("Ed25519-seed") }, this.masterKey, 256);
    return new Uint8Array(seed);
  }
  async generateDID(seed) {
    const publicKeyHash = await crypto.subtle.digest("SHA-256", seed);
    const publicKeyBytes = new Uint8Array(publicKeyHash).slice(0, 32);
    const multicodecPrefix = new Uint8Array([237, 1]);
    const multicodecKey = new Uint8Array(34);
    multicodecKey.set(multicodecPrefix);
    multicodecKey.set(publicKeyBytes, 2);
    const base58Encoded = bufferToBase64url(multicodecKey.buffer).replace(/-/g, "").replace(/_/g, "");
    return `did:key:z${base58Encoded}`;
  }
  clear() {
    this.masterKey = null;
    this.derivedKeys = null;
    this.fromPRF = false;
  }
}
async function encryptData(key, data) {
  let plaintext;
  if (typeof data === "string")
    plaintext = new TextEncoder().encode(data).buffer;
  else if (data instanceof Uint8Array)
    plaintext = data.buffer;
  else
    plaintext = data;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return { ciphertext, iv };
}
async function decryptData(key, encrypted) {
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: encrypted.iv }, key, encrypted.ciphertext);
}
async function decryptDataAsString(key, encrypted) {
  return new TextDecoder().decode(await decryptData(key, encrypted));
}
async function signData(keyPair, data) {
  let dataBuffer;
  if (typeof data === "string")
    dataBuffer = new TextEncoder().encode(data).buffer;
  else if (data instanceof Uint8Array)
    dataBuffer = data.buffer;
  else
    dataBuffer = data;
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, keyPair.privateKey, dataBuffer);
  const publicKey = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  return { data: dataBuffer, signature, publicKey };
}
async function verifySignature(signed) {
  const publicKey = await crypto.subtle.importKey("raw", signed.publicKey, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
  return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, publicKey, signed.signature, signed.data);
}
async function wrapKeyForRecipient(keyToWrap, recipientPublicKey) {
  return crypto.subtle.wrapKey("raw", keyToWrap, recipientPublicKey, { name: "RSA-OAEP" });
}
async function unwrapSharedKey(wrappedKey, privateKey) {
  return crypto.subtle.unwrapKey("raw", wrappedKey, privateKey, { name: "RSA-OAEP" }, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
var keyManagerInstance = null;
function getKeyManager() {
  if (!keyManagerInstance)
    keyManagerInstance = new EncryptIDKeyManager;
  return keyManagerInstance;
}
function resetKeyManager() {
  if (keyManagerInstance) {
    keyManagerInstance.clear();
    keyManagerInstance = null;
  }
}

// src/client/session.ts
var OPERATION_PERMISSIONS = {
  "rspace:view-public": { minAuthLevel: 1 /* BASIC */ },
  "rspace:view-private": { minAuthLevel: 2 /* STANDARD */ },
  "rspace:edit-board": { minAuthLevel: 2 /* STANDARD */ },
  "rspace:create-board": { minAuthLevel: 2 /* STANDARD */ },
  "rspace:delete-board": { minAuthLevel: 3 /* ELEVATED */, maxAgeSeconds: 300 },
  "rspace:encrypt-board": { minAuthLevel: 3 /* ELEVATED */, requiresCapability: "encrypt" },
  "rwallet:view-balance": { minAuthLevel: 1 /* BASIC */ },
  "rwallet:view-history": { minAuthLevel: 2 /* STANDARD */ },
  "rwallet:send-small": { minAuthLevel: 2 /* STANDARD */, requiresCapability: "wallet" },
  "rwallet:send-large": { minAuthLevel: 3 /* ELEVATED */, requiresCapability: "wallet", maxAgeSeconds: 60 },
  "rwallet:add-guardian": { minAuthLevel: 4 /* CRITICAL */, maxAgeSeconds: 60 },
  "rwallet:remove-guardian": { minAuthLevel: 4 /* CRITICAL */, maxAgeSeconds: 60 },
  "rvote:view-proposals": { minAuthLevel: 1 /* BASIC */ },
  "rvote:cast-vote": { minAuthLevel: 3 /* ELEVATED */, requiresCapability: "sign", maxAgeSeconds: 300 },
  "rvote:delegate": { minAuthLevel: 3 /* ELEVATED */, requiresCapability: "wallet" },
  "rfiles:list-files": { minAuthLevel: 2 /* STANDARD */ },
  "rfiles:download-own": { minAuthLevel: 2 /* STANDARD */, requiresCapability: "encrypt" },
  "rfiles:upload": { minAuthLevel: 2 /* STANDARD */, requiresCapability: "encrypt" },
  "rfiles:share": { minAuthLevel: 3 /* ELEVATED */, requiresCapability: "encrypt" },
  "rfiles:delete": { minAuthLevel: 3 /* ELEVATED */, maxAgeSeconds: 300 },
  "rfiles:export-keys": { minAuthLevel: 4 /* CRITICAL */, maxAgeSeconds: 60 },
  "rmaps:view-public": { minAuthLevel: 1 /* BASIC */ },
  "rmaps:add-location": { minAuthLevel: 2 /* STANDARD */ },
  "rmaps:edit-location": { minAuthLevel: 2 /* STANDARD */, requiresCapability: "sign" },
  "account:view-profile": { minAuthLevel: 2 /* STANDARD */ },
  "account:edit-profile": { minAuthLevel: 3 /* ELEVATED */ },
  "account:export-data": { minAuthLevel: 4 /* CRITICAL */, maxAgeSeconds: 60 },
  "account:delete": { minAuthLevel: 4 /* CRITICAL */, maxAgeSeconds: 60 },
  "rspace:create-space": { minAuthLevel: 2 /* STANDARD */ },
  "rspace:configure-space": { minAuthLevel: 3 /* ELEVATED */, maxAgeSeconds: 300 },
  "rspace:delete-space": { minAuthLevel: 4 /* CRITICAL */, maxAgeSeconds: 60 },
  "rspace:invite-member": { minAuthLevel: 2 /* STANDARD */ },
  "rspace:remove-member": { minAuthLevel: 3 /* ELEVATED */, maxAgeSeconds: 300 },
  "rspace:change-visibility": { minAuthLevel: 3 /* ELEVATED */, maxAgeSeconds: 300 },
  "rfunds:create-space": { minAuthLevel: 2 /* STANDARD */ },
  "rfunds:edit-flows": { minAuthLevel: 2 /* STANDARD */ },
  "rfunds:share-space": { minAuthLevel: 2 /* STANDARD */ }
};
var SESSION_STORAGE_KEY = "encryptid_session";
var TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000;

class SessionManager {
  session = null;
  refreshTimer = null;
  constructor() {
    this.restoreSession();
  }
  async createSession(authResult, did, capabilities) {
    const now = Math.floor(Date.now() / 1000);
    const claims = {
      iss: "https://encryptid.jeffemmett.com",
      sub: did,
      aud: ["rspace.online", "rwallet.online", "rvote.online", "rfiles.online", "rmaps.online"],
      iat: now,
      exp: now + 15 * 60,
      jti: bufferToBase64url(crypto.getRandomValues(new Uint8Array(16)).buffer),
      eid: {
        credentialId: authResult.credentialId,
        authLevel: 3 /* ELEVATED */,
        authTime: now,
        capabilities,
        recoveryConfigured: false
      }
    };
    const accessToken = this.createUnsignedToken(claims);
    const refreshToken = this.createRefreshToken(did);
    this.session = { accessToken, refreshToken, claims, lastAuthTime: Date.now() };
    this.persistSession();
    this.scheduleRefresh();
    return this.session;
  }
  getSession() {
    return this.session;
  }
  getDID() {
    return this.session?.claims.sub ?? null;
  }
  getAccessToken() {
    return this.session?.accessToken ?? null;
  }
  getAuthLevel() {
    if (!this.session)
      return 1 /* BASIC */;
    const now = Math.floor(Date.now() / 1000);
    if (now >= this.session.claims.exp)
      return 1 /* BASIC */;
    const authAge = now - this.session.claims.eid.authTime;
    if (authAge < 60)
      return 3 /* ELEVATED */;
    if (authAge < 15 * 60)
      return 2 /* STANDARD */;
    return 1 /* BASIC */;
  }
  canPerform(operation) {
    const permission = OPERATION_PERMISSIONS[operation];
    if (!permission)
      return { allowed: false, reason: "Unknown operation" };
    if (!this.session)
      return { allowed: false, reason: "Not authenticated" };
    const currentLevel = this.getAuthLevel();
    if (currentLevel < permission.minAuthLevel) {
      return { allowed: false, reason: `Requires ${AuthLevel[permission.minAuthLevel]} auth level (current: ${AuthLevel[currentLevel]})` };
    }
    if (permission.requiresCapability) {
      if (!this.session.claims.eid.capabilities[permission.requiresCapability]) {
        return { allowed: false, reason: `Requires ${permission.requiresCapability} capability` };
      }
    }
    if (permission.maxAgeSeconds) {
      const authAge = Math.floor(Date.now() / 1000) - this.session.claims.eid.authTime;
      if (authAge > permission.maxAgeSeconds) {
        return { allowed: false, reason: `Authentication too old (${authAge}s > ${permission.maxAgeSeconds}s)` };
      }
    }
    return { allowed: true };
  }
  requiresFreshAuth(operation) {
    const permission = OPERATION_PERMISSIONS[operation];
    if (!permission)
      return true;
    if (permission.minAuthLevel >= 4 /* CRITICAL */)
      return true;
    if (permission.maxAgeSeconds && permission.maxAgeSeconds <= 60)
      return true;
    return false;
  }
  upgradeAuthLevel(level = 3 /* ELEVATED */) {
    if (!this.session)
      return;
    this.session.claims.eid.authLevel = level;
    this.session.claims.eid.authTime = Math.floor(Date.now() / 1000);
    this.session.lastAuthTime = Date.now();
    this.persistSession();
  }
  clearSession() {
    this.session = null;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}
  }
  isValid() {
    if (!this.session)
      return false;
    return Math.floor(Date.now() / 1000) < this.session.claims.exp;
  }
  createUnsignedToken(claims) {
    const header = { alg: "none", typ: "JWT" };
    return `${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(claims))}.`;
  }
  createRefreshToken(did) {
    return btoa(JSON.stringify({
      sub: did,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      jti: bufferToBase64url(crypto.getRandomValues(new Uint8Array(16)).buffer)
    }));
  }
  persistSession() {
    if (!this.session)
      return;
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.session));
    } catch {}
  }
  restoreSession() {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        if (Math.floor(Date.now() / 1000) < session.claims.exp) {
          this.session = session;
          this.scheduleRefresh();
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch {}
  }
  scheduleRefresh() {
    if (!this.session)
      return;
    if (this.refreshTimer)
      clearTimeout(this.refreshTimer);
    const expiresAt = this.session.claims.exp * 1000;
    const refreshAt = expiresAt - TOKEN_REFRESH_THRESHOLD;
    const delay = Math.max(refreshAt - Date.now(), 0);
    this.refreshTimer = setTimeout(() => this.refreshTokens(), delay);
  }
  async refreshTokens() {
    if (!this.session)
      return;
    const now = Math.floor(Date.now() / 1000);
    this.session.claims.eid.authLevel = Math.min(this.session.claims.eid.authLevel, 2 /* STANDARD */);
    this.session.claims.iat = now;
    this.session.claims.exp = now + 15 * 60;
    this.session.claims.jti = bufferToBase64url(crypto.getRandomValues(new Uint8Array(16)).buffer);
    this.session.accessToken = this.createUnsignedToken(this.session.claims);
    this.persistSession();
    this.scheduleRefresh();
  }
}
var sessionManagerInstance = null;
function getSessionManager() {
  if (!sessionManagerInstance)
    sessionManagerInstance = new SessionManager;
  return sessionManagerInstance;
}

// src/client/recovery.ts
class RecoveryManager {
  config = null;
  activeRequest = null;
  constructor() {
    this.loadConfig();
  }
  async initializeRecovery(threshold = 3) {
    this.config = {
      threshold,
      delaySeconds: 48 * 60 * 60,
      guardians: [],
      guardianListHash: "",
      updatedAt: Date.now()
    };
    await this.saveConfig();
    return this.config;
  }
  async addGuardian(guardian) {
    if (!this.config)
      throw new Error("Recovery not initialized");
    if (this.config.guardians.length >= 7)
      throw new Error("Maximum of 7 guardians allowed");
    const newGuardian = {
      ...guardian,
      id: bufferToBase64url(crypto.getRandomValues(new Uint8Array(16)).buffer),
      addedAt: Date.now()
    };
    this.config.guardians.push(newGuardian);
    this.config.guardianListHash = await this.hashGuardianList();
    this.config.updatedAt = Date.now();
    await this.saveConfig();
    return newGuardian;
  }
  async removeGuardian(guardianId) {
    if (!this.config)
      throw new Error("Recovery not initialized");
    const index = this.config.guardians.findIndex((g) => g.id === guardianId);
    if (index === -1)
      throw new Error("Guardian not found");
    const remainingWeight = this.config.guardians.filter((g) => g.id !== guardianId).reduce((sum, g) => sum + g.weight, 0);
    if (remainingWeight < this.config.threshold)
      throw new Error("Cannot remove guardian: would make recovery impossible");
    this.config.guardians.splice(index, 1);
    this.config.guardianListHash = await this.hashGuardianList();
    this.config.updatedAt = Date.now();
    await this.saveConfig();
  }
  async setThreshold(threshold) {
    if (!this.config)
      throw new Error("Recovery not initialized");
    const totalWeight = this.config.guardians.reduce((sum, g) => sum + g.weight, 0);
    if (threshold > totalWeight)
      throw new Error("Threshold cannot exceed total guardian weight");
    if (threshold < 1)
      throw new Error("Threshold must be at least 1");
    this.config.threshold = threshold;
    this.config.updatedAt = Date.now();
    await this.saveConfig();
  }
  async setDelay(delaySeconds) {
    if (!this.config)
      throw new Error("Recovery not initialized");
    if (delaySeconds < 3600 || delaySeconds > 7 * 24 * 3600)
      throw new Error("Delay must be between 1 hour and 7 days");
    this.config.delaySeconds = delaySeconds;
    this.config.updatedAt = Date.now();
    await this.saveConfig();
  }
  getConfig() {
    return this.config;
  }
  isConfigured() {
    if (!this.config)
      return false;
    return this.config.guardians.reduce((sum, g) => sum + g.weight, 0) >= this.config.threshold;
  }
  async verifyGuardian(guardianId) {
    if (!this.config)
      throw new Error("Recovery not initialized");
    const guardian = this.config.guardians.find((g) => g.id === guardianId);
    if (!guardian)
      throw new Error("Guardian not found");
    guardian.lastVerified = Date.now();
    await this.saveConfig();
    return true;
  }
  async initiateRecovery(newCredentialId) {
    if (!this.config)
      throw new Error("Recovery not configured");
    if (this.activeRequest?.status === "pending")
      throw new Error("Recovery already in progress");
    const now = Date.now();
    this.activeRequest = {
      id: bufferToBase64url(crypto.getRandomValues(new Uint8Array(16)).buffer),
      accountDID: "",
      newCredentialId,
      initiatedAt: now,
      completesAt: now + this.config.delaySeconds * 1000,
      status: "pending",
      approvals: [],
      approvalWeight: 0
    };
    return this.activeRequest;
  }
  async approveRecovery(guardianId, signature) {
    if (!this.activeRequest || this.activeRequest.status !== "pending")
      throw new Error("No pending recovery request");
    if (!this.config)
      throw new Error("Recovery not configured");
    const guardian = this.config.guardians.find((g) => g.id === guardianId);
    if (!guardian)
      throw new Error("Guardian not found");
    if (this.activeRequest.approvals.some((a) => a.guardianId === guardianId))
      throw new Error("Guardian already approved");
    this.activeRequest.approvals.push({ guardianId, approvedAt: Date.now(), signature });
    this.activeRequest.approvalWeight += guardian.weight;
    if (this.activeRequest.approvalWeight >= this.config.threshold) {
      this.activeRequest.status = "approved";
    }
    return this.activeRequest;
  }
  async cancelRecovery() {
    if (!this.activeRequest || this.activeRequest.status !== "pending")
      throw new Error("No pending recovery request to cancel");
    this.activeRequest.status = "cancelled";
    this.activeRequest = null;
  }
  async completeRecovery() {
    if (!this.activeRequest)
      throw new Error("No recovery request");
    if (this.activeRequest.status !== "approved")
      throw new Error("Recovery not approved");
    if (Date.now() < this.activeRequest.completesAt) {
      const remaining = this.activeRequest.completesAt - Date.now();
      throw new Error(`Time-lock not expired. ${Math.ceil(remaining / 1000 / 60)} minutes remaining.`);
    }
    this.activeRequest.status = "completed";
    this.activeRequest = null;
  }
  getActiveRequest() {
    return this.activeRequest;
  }
  async hashGuardianList() {
    if (!this.config)
      return "";
    const sortedIds = this.config.guardians.map((g) => g.id).sort().join(",");
    const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(sortedIds));
    return bufferToBase64url(hash);
  }
  async saveConfig() {
    if (!this.config)
      return;
    try {
      localStorage.setItem("encryptid_recovery", JSON.stringify(this.config));
    } catch {}
  }
  loadConfig() {
    try {
      const stored = localStorage.getItem("encryptid_recovery");
      if (stored)
        this.config = JSON.parse(stored);
    } catch {}
  }
}
var recoveryManagerInstance = null;
function getRecoveryManager() {
  if (!recoveryManagerInstance)
    recoveryManagerInstance = new RecoveryManager;
  return recoveryManagerInstance;
}
function getGuardianTypeInfo(type) {
  switch (type) {
    case "secondary_passkey" /* SECONDARY_PASSKEY */:
      return { name: "Backup Passkey", description: "Another device you own (phone, YubiKey, etc.)", icon: "key", setupInstructions: "Register a passkey on a second device you control." };
    case "trusted_contact" /* TRUSTED_CONTACT */:
      return { name: "Trusted Contact", description: "A friend or family member with their own EncryptID", icon: "user", setupInstructions: "Ask a trusted person to create an EncryptID account." };
    case "hardware_key" /* HARDWARE_KEY */:
      return { name: "Hardware Security Key", description: "A YubiKey or similar device stored offline", icon: "shield", setupInstructions: "Register a hardware security key and store it safely." };
    case "institutional" /* INSTITUTIONAL */:
      return { name: "Recovery Service", description: "A professional recovery service provider", icon: "building", setupInstructions: "Connect with a trusted recovery service." };
    case "time_delayed_self" /* TIME_DELAYED_SELF */:
      return { name: "Time-Delayed Self", description: "Recover yourself after a waiting period", icon: "clock", setupInstructions: "Set up a recovery option that requires waiting before completing." };
    default:
      return { name: "Unknown", description: "Unknown guardian type", icon: "question", setupInstructions: "" };
  }
}

export { EncryptIDKeyManager, encryptData, decryptData, decryptDataAsString, signData, verifySignature, wrapKeyForRecipient, unwrapSharedKey, getKeyManager, resetKeyManager, OPERATION_PERMISSIONS, SessionManager, getSessionManager, RecoveryManager, getRecoveryManager, getGuardianTypeInfo };
