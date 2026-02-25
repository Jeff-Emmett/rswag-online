import {
  getGuardianTypeInfo,
  getKeyManager,
  getRecoveryManager,
  getSessionManager
} from "../index-24r9wkfe.js";
import {
  authenticatePasskey,
  detectCapabilities,
  registerPasskey,
  startConditionalUI
} from "../index-2cp5044h.js";
import {
  AuthLevel
} from "../index-5c1t4ftn.js";

// src/ui/login-button.ts
var PASSKEY_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="passkey-icon"><circle cx="12" cy="10" r="3"/><path d="M12 13v8"/><path d="M9 18h6"/><circle cx="12" cy="10" r="7"/></svg>`;
var styles = `
:host { --eid-primary: #06b6d4; --eid-primary-hover: #0891b2; --eid-bg: #0f172a; --eid-bg-hover: #1e293b; --eid-text: #f1f5f9; --eid-text-secondary: #94a3b8; --eid-radius: 8px; display: inline-block; font-family: system-ui, -apple-system, sans-serif; }
.login-btn { display: flex; align-items: center; gap: 12px; padding: 12px 24px; background: var(--eid-primary); color: white; border: none; border-radius: var(--eid-radius); font-size: 1rem; font-weight: 500; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3); }
.login-btn:hover { background: var(--eid-primary-hover); transform: translateY(-1px); }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.login-btn.outline { background: transparent; border: 2px solid var(--eid-primary); color: var(--eid-primary); }
.login-btn.outline:hover { background: var(--eid-primary); color: white; }
.login-btn.small { padding: 8px 16px; font-size: 0.875rem; }
.login-btn.large { padding: 16px 32px; font-size: 1.125rem; }
.passkey-icon { width: 24px; height: 24px; }
.user-info { display: flex; align-items: center; gap: 12px; padding: 8px 16px; background: var(--eid-bg); border-radius: var(--eid-radius); color: var(--eid-text); cursor: pointer; }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--eid-primary); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; }
.user-did { font-size: 0.75rem; color: var(--eid-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
.auth-level { font-size: 0.625rem; padding: 2px 6px; border-radius: 4px; }
.auth-level.elevated { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.auth-level.standard { background: rgba(234, 179, 8, 0.2); color: #eab308; }
.dropdown { position: absolute; top: 100%; right: 0; margin-top: 8px; background: var(--eid-bg); border-radius: var(--eid-radius); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3); min-width: 200px; z-index: 100; overflow: hidden; }
.dropdown-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; color: var(--eid-text); cursor: pointer; transition: background 0.2s; }
.dropdown-item:hover { background: var(--eid-bg-hover); }
.dropdown-item.danger { color: #ef4444; }
.dropdown-divider { height: 1px; background: #334155; margin: 4px 0; }
.loading-spinner { width: 20px; height: 20px; border: 2px solid transparent; border-top-color: currentColor; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
`;

class EncryptIDLoginButton extends HTMLElement {
  shadow;
  loading = false;
  showDropdown = false;
  capabilities = null;
  static get observedAttributes() {
    return ["size", "variant", "label", "show-user"];
  }
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }
  async connectedCallback() {
    this.capabilities = await detectCapabilities();
    if (this.capabilities.conditionalUI)
      this.startConditionalAuth();
    this.render();
    document.addEventListener("click", (e) => {
      if (!this.contains(e.target)) {
        this.showDropdown = false;
        this.render();
      }
    });
  }
  attributeChangedCallback() {
    this.render();
  }
  get size() {
    return this.getAttribute("size") || "medium";
  }
  get variant() {
    return this.getAttribute("variant") || "primary";
  }
  get label() {
    return this.getAttribute("label") || "Sign in with Passkey";
  }
  get showUser() {
    return this.hasAttribute("show-user");
  }
  render() {
    const session = getSessionManager();
    const isLoggedIn = session.isValid();
    const did = session.getDID();
    const authLevel = session.getAuthLevel();
    this.shadow.innerHTML = `<style>${styles}</style><div class="login-container" style="position:relative">
      ${isLoggedIn && this.showUser ? this.renderUserInfo(did, authLevel) : this.renderLoginButton()}
      ${this.showDropdown ? this.renderDropdown() : ""}
    </div>`;
    this.attachEventListeners();
  }
  renderLoginButton() {
    const sizeClass = this.size === "medium" ? "" : this.size;
    const variantClass = this.variant === "primary" ? "" : this.variant;
    return `<button class="login-btn ${sizeClass} ${variantClass}" ${this.loading ? "disabled" : ""}>
      ${this.loading ? '<div class="loading-spinner"></div>' : PASSKEY_ICON}
      <span>${this.loading ? "Authenticating..." : this.label}</span></button>`;
  }
  renderUserInfo(did, authLevel) {
    const shortDID = did.slice(0, 20) + "..." + did.slice(-8);
    const initial = did.slice(8, 10).toUpperCase();
    const levelName = AuthLevel[authLevel].toLowerCase();
    return `<div class="user-info"><div class="user-avatar">${initial}</div>
      <div><div class="user-did">${shortDID}</div><span class="auth-level ${levelName}">${levelName}</span></div></div>`;
  }
  renderDropdown() {
    return `<div class="dropdown">
      <div class="dropdown-item" data-action="profile">Profile</div>
      <div class="dropdown-item" data-action="recovery">Recovery Settings</div>
      <div class="dropdown-item" data-action="upgrade">Upgrade Auth Level</div>
      <div class="dropdown-divider"></div>
      <div class="dropdown-item danger" data-action="logout">Sign Out</div></div>`;
  }
  attachEventListeners() {
    const session = getSessionManager();
    if (session.isValid() && this.showUser) {
      this.shadow.querySelector(".user-info")?.addEventListener("click", () => {
        this.showDropdown = !this.showDropdown;
        this.render();
      });
      this.shadow.querySelectorAll(".dropdown-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          this.handleDropdownAction(item.dataset.action);
        });
      });
    } else {
      this.shadow.querySelector(".login-btn")?.addEventListener("click", () => this.handleLogin());
    }
  }
  async handleLogin() {
    if (this.loading)
      return;
    this.loading = true;
    this.render();
    try {
      const result = await authenticatePasskey();
      const keyManager = getKeyManager();
      if (result.prfOutput)
        await keyManager.initFromPRF(result.prfOutput);
      const keys = await keyManager.getKeys();
      await getSessionManager().createSession(result, keys.did, { encrypt: true, sign: true, wallet: false });
      this.dispatchEvent(new CustomEvent("login-success", { detail: { did: keys.did, credentialId: result.credentialId, prfAvailable: !!result.prfOutput }, bubbles: true }));
    } catch (error) {
      if (error.name === "NotAllowedError" || error.message?.includes("No credential")) {
        this.dispatchEvent(new CustomEvent("login-register-needed", { bubbles: true }));
      } else {
        this.dispatchEvent(new CustomEvent("login-error", { detail: { error: error.message }, bubbles: true }));
      }
    } finally {
      this.loading = false;
      this.render();
    }
  }
  async handleDropdownAction(action) {
    this.showDropdown = false;
    if (action === "logout") {
      getSessionManager().clearSession();
      getKeyManager().clear();
      this.dispatchEvent(new CustomEvent("logout", { bubbles: true }));
    } else if (action === "upgrade") {
      try {
        await authenticatePasskey();
        getSessionManager().upgradeAuthLevel(3 /* ELEVATED */);
        this.dispatchEvent(new CustomEvent("auth-upgraded", { detail: { level: 3 /* ELEVATED */ }, bubbles: true }));
      } catch {}
    } else {
      this.dispatchEvent(new CustomEvent("navigate", { detail: { path: `/${action}` }, bubbles: true }));
    }
    this.render();
  }
  async startConditionalAuth() {
    try {
      const result = await startConditionalUI();
      if (result) {
        const keyManager = getKeyManager();
        if (result.prfOutput)
          await keyManager.initFromPRF(result.prfOutput);
        const keys = await keyManager.getKeys();
        await getSessionManager().createSession(result, keys.did, { encrypt: true, sign: true, wallet: false });
        this.dispatchEvent(new CustomEvent("login-success", { detail: { did: keys.did, credentialId: result.credentialId, viaConditionalUI: true }, bubbles: true }));
        this.render();
      }
    } catch {}
  }
  async register(username, displayName) {
    this.loading = true;
    this.render();
    try {
      const credential = await registerPasskey(username, displayName);
      this.dispatchEvent(new CustomEvent("register-success", { detail: { credentialId: credential.credentialId, prfSupported: credential.prfSupported }, bubbles: true }));
      await this.handleLogin();
    } catch (error) {
      this.dispatchEvent(new CustomEvent("register-error", { detail: { error: error.message }, bubbles: true }));
    } finally {
      this.loading = false;
      this.render();
    }
  }
}
customElements.define("encryptid-login", EncryptIDLoginButton);
// src/ui/guardian-setup.ts
class GuardianSetupElement extends HTMLElement {
  shadow;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    const manager = getRecoveryManager();
    const config = manager.getConfig();
    if (!config) {
      manager.initializeRecovery(3).then(() => this.render());
    } else {
      this.render();
    }
  }
  render() {
    const manager = getRecoveryManager();
    const config = manager.getConfig();
    const guardians = config?.guardians ?? [];
    const threshold = config?.threshold ?? 3;
    const totalWeight = guardians.reduce((sum, g) => sum + g.weight, 0);
    const isConfigured = totalWeight >= threshold;
    this.shadow.innerHTML = `
      <style>
        :host { display: block; font-family: system-ui, sans-serif; color: #f1f5f9; }
        .setup { background: #0f172a; border-radius: 8px; padding: 24px; max-width: 600px; }
        h2 { margin: 0 0 8px; font-size: 1.5rem; }
        .subtitle { color: #94a3b8; font-size: 0.875rem; margin: 0 0 24px; }
        .status { display: flex; align-items: center; gap: 16px; padding: 16px; background: #1e293b; border-radius: 8px; margin-bottom: 24px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; background: ${isConfigured ? "#22c55e" : "#eab308"}; }
        .guardian { display: flex; align-items: center; gap: 16px; padding: 16px; background: #1e293b; border-radius: 8px; margin-bottom: 12px; border: 1px solid #475569; }
        .icon { width: 48px; height: 48px; border-radius: 50%; background: #334155; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
        .info { flex: 1; }
        .name { font-weight: 500; }
        .type { font-size: 0.75rem; color: #94a3b8; }
      </style>
      <div class="setup">
        <h2>Social Recovery</h2>
        <p class="subtitle">Set up guardians to recover your account without seed phrases</p>
        <div class="status">
          <div class="dot"></div>
          <div>
            <div>${isConfigured ? "Recovery Configured" : "Setup Incomplete"}</div>
            <div style="font-size:0.75rem;color:#94a3b8">${totalWeight}/${threshold} guardians</div>
          </div>
        </div>
        ${guardians.map((g) => {
      const info = getGuardianTypeInfo(g.type);
      return `<div class="guardian"><div class="icon">${info.icon === "key" ? "\uD83D\uDD11" : info.icon === "user" ? "\uD83D\uDC64" : info.icon === "shield" ? "\uD83D\uDEE1️" : info.icon === "building" ? "\uD83C\uDFE2" : "⏰"}</div><div class="info"><div class="name">${g.name}</div><div class="type">${info.name}</div></div></div>`;
    }).join("")}
      </div>
    `;
  }
}
customElements.define("encryptid-guardian-setup", GuardianSetupElement);
export {
  GuardianSetupElement,
  EncryptIDLoginButton
};
