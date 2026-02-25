/**
 * EncryptID WebSocket Authentication
 *
 * Since WebSocket upgrade requests carry the initial HTTP headers,
 * we verify the token during the upgrade handshake.
 *
 * Supported token locations (checked in order):
 * 1. `token` query parameter: ws://host/ws?token=xxx
 * 2. Sec-WebSocket-Protocol subprotocol: "encryptid.TOKEN_HERE"
 * 3. Cookie: encryptid_token=xxx
 */
import { type VerifyOptions } from './jwt-verify.js';
import type { EncryptIDClaims } from '../types/index.js';
/**
 * Authenticate a WebSocket upgrade request.
 * Returns claims if a valid token is found, null otherwise.
 */
export declare function authenticateWSUpgrade(request: Request, options?: VerifyOptions): Promise<EncryptIDClaims | null>;
