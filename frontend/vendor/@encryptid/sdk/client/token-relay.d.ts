/**
 * EncryptID Token Relay — Cross-Domain Authentication
 *
 * Since .online is a public suffix, cookies can't be shared across
 * r*.online domains. This module uses postMessage via hidden iframes
 * to relay the JWT token to sibling modules after authentication.
 *
 * Usage (on the authenticating domain, e.g., rspace.online):
 *
 *   import { shareTokenAcrossModules, MODULE_DOMAINS } from '@encryptid/sdk/client/token-relay';
 *   await shareTokenAcrossModules(jwt, MODULE_DOMAINS);
 *
 * Usage (on each module, add a relay page at /auth/relay):
 *
 *   import { initTokenRelayListener } from '@encryptid/sdk/client/token-relay';
 *   initTokenRelayListener();  // Listens for postMessage, stores token
 */
/** All r*.online module domains for token relay */
export declare const MODULE_DOMAINS: readonly ["rvote.online", "rnotes.online", "rmaps.online", "rcal.online", "rfunds.online", "rtube.online", "rfiles.online", "rmail.online", "rtrips.online", "rnetwork.online", "rwallet.online", "rstack.online", "rspace.online"];
interface RelayResult {
    domain: string;
    success: boolean;
    error?: string;
}
/**
 * Share an EncryptID JWT token across all r*.online module domains.
 * Creates hidden iframes pointing to each module's /auth/relay page,
 * then sends the token via postMessage.
 *
 * @param token - The JWT token to share
 * @param domains - Array of domains to relay to (defaults to MODULE_DOMAINS)
 * @param timeout - Timeout per domain in ms (default 5000)
 * @returns Results for each domain
 */
export declare function shareTokenAcrossModules(token: string, domains?: readonly string[], timeout?: number): Promise<RelayResult[]>;
/**
 * Clear the token from all module domains.
 * Call this on sign-out.
 */
export declare function clearTokenAcrossModules(domains?: readonly string[], timeout?: number): Promise<void>;
/**
 * Initialize the token relay listener on a module's /auth/relay page.
 * Listens for postMessage from sibling r*.online domains and stores
 * the token in localStorage.
 *
 * This should be called on a minimal page served at /auth/relay on each module.
 */
export declare function initTokenRelayListener(): void;
/**
 * Get the locally stored EncryptID token, if any.
 */
export declare function getStoredToken(): string | null;
/**
 * Request the token from a sibling domain if we don't have it locally.
 * Creates a hidden iframe to the specified domain and asks for the token.
 */
export declare function requestTokenFromDomain(domain: string, timeout?: number): Promise<string | null>;
export {};
