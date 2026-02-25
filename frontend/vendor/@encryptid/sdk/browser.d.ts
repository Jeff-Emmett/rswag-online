/**
 * EncryptID Browser Bundle
 *
 * IIFE entry point that provides window.EncryptID for vanilla JS apps.
 * Build: bun build ./src/browser.ts --outfile dist/encryptid.browser.js --target browser
 *
 * Usage:
 *   <script src="encryptid.browser.js"></script>
 *   <script>
 *     EncryptID.renderAuthButton('auth-container');
 *     // or
 *     const result = await EncryptID.authenticate();
 *   </script>
 */
import { EncryptIDClient } from './client/api-client.js';
import { detectCapabilities } from './client/webauthn.js';
import { AuthLevel } from './client/session.js';
import './ui/login-button.js';
import './ui/guardian-setup.js';
interface StoredUser {
    did: string;
    username: string;
    token: string;
}
/**
 * Authenticate with an existing passkey
 */
declare function authenticate(): Promise<StoredUser>;
/**
 * Register a new passkey
 */
declare function register(username: string, displayName?: string): Promise<StoredUser>;
/**
 * Log out — clear stored auth state
 */
declare function logout(): void;
/**
 * Check if user is currently authenticated
 */
declare function isAuthenticated(): boolean;
/**
 * Get stored user info
 */
declare function getUser(): StoredUser | null;
/**
 * Get the stored token
 */
declare function getToken(): string | null;
/**
 * Require authentication — redirects to home with login hint if not authenticated
 */
declare function requireAuth(redirectUrl?: string): boolean;
/**
 * Set a recovery email for the authenticated user
 */
declare function setRecoveryEmail(email: string): Promise<void>;
/**
 * Request account recovery via email
 */
declare function requestRecovery(email: string): Promise<void>;
/**
 * Render an auth button into a container element
 */
declare function renderAuthButton(containerId: string): void;
/**
 * Verify the stored token is still valid, refresh if needed
 */
declare function verifySession(): Promise<boolean>;
declare const EncryptID: {
    client: EncryptIDClient;
    authenticate: typeof authenticate;
    register: typeof register;
    logout: typeof logout;
    isAuthenticated: typeof isAuthenticated;
    getUser: typeof getUser;
    getToken: typeof getToken;
    requireAuth: typeof requireAuth;
    setRecoveryEmail: typeof setRecoveryEmail;
    requestRecovery: typeof requestRecovery;
    renderAuthButton: typeof renderAuthButton;
    verifySession: typeof verifySession;
    detectCapabilities: typeof detectCapabilities;
    AuthLevel: typeof AuthLevel;
    VERSION: string;
};
export default EncryptID;
