// src/client/webauthn.ts
var DEFAULT_CONFIG = {
  rpId: "jeffemmett.com",
  rpName: "EncryptID",
  origin: typeof window !== "undefined" ? window.location.origin : "",
  userVerification: "required",
  timeout: 60000
};
var conditionalUIAbortController = null;
function abortConditionalUI() {
  if (conditionalUIAbortController) {
    conditionalUIAbortController.abort();
    conditionalUIAbortController = null;
  }
}
function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0;i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function base64urlToBuffer(base64url) {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0;i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
function generateChallenge() {
  return crypto.getRandomValues(new Uint8Array(32)).buffer;
}
async function generatePRFSalt(purpose) {
  const encoder = new TextEncoder;
  const data = encoder.encode(`encryptid-prf-salt-${purpose}-v1`);
  return crypto.subtle.digest("SHA-256", data);
}
async function registerPasskey(username, displayName, config = {}) {
  abortConditionalUI();
  const cfg = { ...DEFAULT_CONFIG, ...config };
  if (!window.PublicKeyCredential) {
    throw new Error("WebAuthn is not supported in this browser");
  }
  const platformAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  const userId = crypto.getRandomValues(new Uint8Array(32));
  const challenge = generateChallenge();
  const prfSalt = await generatePRFSalt("master-key");
  const createOptions = {
    publicKey: {
      challenge: new Uint8Array(challenge),
      rp: { id: cfg.rpId, name: cfg.rpName },
      user: { id: userId, name: username, displayName },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" }
      ],
      authenticatorSelection: {
        residentKey: "required",
        requireResidentKey: true,
        userVerification: cfg.userVerification,
        authenticatorAttachment: platformAvailable ? "platform" : undefined
      },
      attestation: "none",
      timeout: cfg.timeout,
      extensions: {
        prf: { eval: { first: new Uint8Array(prfSalt) } },
        credProps: true
      }
    }
  };
  const credential = await navigator.credentials.create(createOptions);
  if (!credential)
    throw new Error("Failed to create credential");
  const response = credential.response;
  const prfSupported = credential.getClientExtensionResults()?.prf?.enabled === true;
  const publicKey = response.getPublicKey();
  if (!publicKey)
    throw new Error("Failed to get public key from credential");
  return {
    credentialId: bufferToBase64url(credential.rawId),
    publicKey,
    userId: bufferToBase64url(userId.buffer),
    username,
    createdAt: Date.now(),
    prfSupported,
    transports: response.getTransports?.()
  };
}
async function authenticatePasskey(credentialId, config = {}) {
  abortConditionalUI();
  const cfg = { ...DEFAULT_CONFIG, ...config };
  if (!window.PublicKeyCredential) {
    throw new Error("WebAuthn is not supported in this browser");
  }
  const challenge = generateChallenge();
  const prfSalt = await generatePRFSalt("master-key");
  const allowCredentials = credentialId ? [{ type: "public-key", id: new Uint8Array(base64urlToBuffer(credentialId)) }] : undefined;
  const getOptions = {
    publicKey: {
      challenge: new Uint8Array(challenge),
      rpId: cfg.rpId,
      allowCredentials,
      userVerification: cfg.userVerification,
      timeout: cfg.timeout,
      extensions: {
        prf: { eval: { first: new Uint8Array(prfSalt) } }
      }
    }
  };
  const credential = await navigator.credentials.get(getOptions);
  if (!credential)
    throw new Error("Authentication failed");
  const response = credential.response;
  const prfResults = credential.getClientExtensionResults()?.prf?.results;
  return {
    credentialId: bufferToBase64url(credential.rawId),
    userId: response.userHandle ? bufferToBase64url(response.userHandle) : "",
    prfOutput: prfResults?.first,
    signature: response.signature,
    authenticatorData: response.authenticatorData
  };
}
async function isConditionalMediationAvailable() {
  if (!window.PublicKeyCredential)
    return false;
  if (typeof PublicKeyCredential.isConditionalMediationAvailable === "function") {
    return PublicKeyCredential.isConditionalMediationAvailable();
  }
  return false;
}
async function startConditionalUI(config = {}) {
  const available = await isConditionalMediationAvailable();
  if (!available)
    return null;
  abortConditionalUI();
  conditionalUIAbortController = new AbortController;
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const challenge = generateChallenge();
  const prfSalt = await generatePRFSalt("master-key");
  try {
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge: new Uint8Array(challenge),
        rpId: cfg.rpId,
        userVerification: cfg.userVerification,
        timeout: cfg.timeout,
        extensions: {
          prf: { eval: { first: new Uint8Array(prfSalt) } }
        }
      },
      mediation: "conditional",
      signal: conditionalUIAbortController.signal
    });
    conditionalUIAbortController = null;
    if (!credential)
      return null;
    const response = credential.response;
    const prfResults = credential.getClientExtensionResults()?.prf?.results;
    return {
      credentialId: bufferToBase64url(credential.rawId),
      userId: response.userHandle ? bufferToBase64url(response.userHandle) : "",
      prfOutput: prfResults?.first,
      signature: response.signature,
      authenticatorData: response.authenticatorData
    };
  } catch {
    return null;
  }
}
async function detectCapabilities() {
  const capabilities = {
    webauthn: false,
    platformAuthenticator: false,
    conditionalUI: false,
    prfExtension: false
  };
  if (!window.PublicKeyCredential)
    return capabilities;
  capabilities.webauthn = true;
  try {
    capabilities.platformAuthenticator = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    capabilities.platformAuthenticator = false;
  }
  capabilities.conditionalUI = await isConditionalMediationAvailable();
  capabilities.prfExtension = true;
  return capabilities;
}

export { abortConditionalUI, bufferToBase64url, base64urlToBuffer, generateChallenge, registerPasskey, authenticatePasskey, isConditionalMediationAvailable, startConditionalUI, detectCapabilities };
