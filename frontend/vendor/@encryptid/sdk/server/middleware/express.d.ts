/**
 * EncryptID Express Middleware
 *
 * Authentication middleware for Express and compatible frameworks.
 */
import { type VerifyOptions } from '../jwt-verify.js';
import { type SpaceAuthOptions } from '../space-auth.js';
import type { EncryptIDClaims, SpaceAuthResult } from '../../types/index.js';
declare global {
    namespace Express {
        interface Request {
            encryptid?: EncryptIDClaims;
            spaceAuth?: SpaceAuthResult;
        }
    }
}
interface ExpressRequest {
    headers: Record<string, string | string[] | undefined>;
    method: string;
    encryptid?: EncryptIDClaims;
    spaceAuth?: SpaceAuthResult;
}
interface ExpressResponse {
    status(code: number): ExpressResponse;
    json(body: unknown): void;
}
type NextFunction = () => void;
/**
 * Express middleware that verifies EncryptID JWT tokens
 *
 * Usage:
 * ```ts
 * import express from 'express';
 * import { encryptIDAuth } from '@encryptid/sdk/server/express';
 *
 * const app = express();
 *
 * app.use('/api', encryptIDAuth());
 *
 * app.get('/api/profile', (req, res) => {
 *   res.json({ did: req.encryptid.did });
 * });
 * ```
 */
export declare function encryptIDAuth(options?: VerifyOptions): (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => Promise<void>;
/**
 * Optional auth — sets session if token present, continues either way
 */
export declare function encryptIDOptional(options?: VerifyOptions): (req: ExpressRequest, _res: ExpressResponse, next: NextFunction) => Promise<void>;
export interface EncryptIDSpaceAuthConfig extends SpaceAuthOptions {
    /** Function to extract space slug from request (default: req.params.slug) */
    getSlug?: (req: ExpressRequest & {
        params?: Record<string, string>;
    }) => string;
}
/**
 * Express middleware for space-aware auth.
 *
 * Usage:
 * ```ts
 * app.use('/api/spaces/:slug', encryptIDSpaceAuth({
 *   getSpaceConfig: async (slug) => db.getSpace(slug),
 * }));
 *
 * app.get('/api/spaces/:slug', (req, res) => {
 *   const { readOnly, isOwner } = req.spaceAuth;
 *   res.json({ canEdit: !readOnly, isOwner });
 * });
 * ```
 */
export declare function encryptIDSpaceAuth(config: EncryptIDSpaceAuthConfig): (req: ExpressRequest & {
    params?: Record<string, string>;
}, res: ExpressResponse, next: NextFunction) => Promise<void>;
export {};
