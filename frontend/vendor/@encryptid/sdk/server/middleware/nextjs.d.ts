/**
 * EncryptID Next.js Middleware
 *
 * Helpers for protecting Next.js App Router routes and API endpoints.
 */
import { type VerifyOptions } from '../jwt-verify.js';
import { type SpaceAuthOptions } from '../space-auth.js';
import type { EncryptIDClaims, SpaceAuthResult, SpaceVisibility } from '../../types/index.js';
import type { ResolvedRole, SpaceMembership } from '../../types/roles.js';
export interface EncryptIDNextConfig extends VerifyOptions {
    /** Paths that don't require authentication */
    publicPaths?: string[];
    /** Redirect URL for unauthenticated requests (null = return 401) */
    loginUrl?: string | null;
}
/**
 * Get EncryptID session from a Next.js request
 *
 * Usage in API routes:
 * ```ts
 * import { getEncryptIDSession } from '@encryptid/sdk/server/nextjs';
 *
 * export async function GET(req: Request) {
 *   const session = await getEncryptIDSession(req);
 *   if (!session) return new Response('Unauthorized', { status: 401 });
 *   // session.sub, session.did, session.eid.authLevel, etc.
 * }
 * ```
 */
export declare function getEncryptIDSession(request: Request, options?: VerifyOptions): Promise<EncryptIDClaims | null>;
/**
 * Protect a Next.js API route handler
 *
 * Usage:
 * ```ts
 * import { withEncryptID } from '@encryptid/sdk/server/nextjs';
 *
 * export const GET = withEncryptID(async (req, session) => {
 *   return Response.json({ user: session.sub, did: session.did });
 * });
 * ```
 */
export declare function withEncryptID(handler: (request: Request, session: EncryptIDClaims) => Promise<Response>, options?: VerifyOptions): (request: Request) => Promise<Response>;
/**
 * Create Next.js middleware for EncryptID
 *
 * Usage in middleware.ts:
 * ```ts
 * import { createEncryptIDMiddleware } from '@encryptid/sdk/server/nextjs';
 *
 * const encryptIDMiddleware = createEncryptIDMiddleware({
 *   publicPaths: ['/auth/signin', '/api/auth'],
 *   loginUrl: '/auth/signin',
 * });
 *
 * export function middleware(request: NextRequest) {
 *   return encryptIDMiddleware(request);
 * }
 * ```
 */
export declare function createEncryptIDMiddleware(config?: EncryptIDNextConfig): (request: Request) => Promise<Response | null>;
/**
 * Check space access in a Next.js API route or server component.
 *
 * Usage:
 * ```ts
 * const result = await checkSpaceAccess(request, spaceSlug, {
 *   getSpaceConfig: async (slug) => {
 *     const space = await prisma.space.findUnique({ where: { slug } });
 *     if (!space) return null;
 *     return { spaceSlug: slug, visibility: space.visibility, app: 'rvote' };
 *   },
 * });
 * if (!result.allowed) return new Response(result.reason, { status: 401 });
 * ```
 */
export declare function checkSpaceAccess(request: Request, spaceSlug: string, options: SpaceAuthOptions): Promise<SpaceAuthResult>;
/**
 * HOC that wraps a Next.js API route handler with space auth.
 *
 * Usage:
 * ```ts
 * export const POST = withSpaceAuth(
 *   async (req, spaceAuth, slug) => {
 *     return Response.json({ owner: spaceAuth.isOwner });
 *   },
 *   (req) => new URL(req.url).pathname.split('/')[2],
 *   { getSpaceConfig: async (slug) => { ... } },
 * );
 * ```
 */
export declare function withSpaceAuth(handler: (request: Request, spaceAuth: SpaceAuthResult, spaceSlug: string) => Promise<Response>, getSlug: (request: Request) => string, options: SpaceAuthOptions): (request: Request) => Promise<Response>;
export interface SpaceRoleOptions extends SpaceAuthOptions {
    /** Look up membership for a DID in a space. You provide the DB query. */
    getMembership: (userDID: string, spaceSlug: string) => Promise<SpaceMembership | null>;
    /** Resolve visibility for a space slug. If not provided, uses getSpaceConfig. */
    getVisibility?: (spaceSlug: string) => Promise<SpaceVisibility>;
}
export interface SpaceRoleResult {
    spaceAuth: SpaceAuthResult;
    resolvedRole: ResolvedRole;
}
/**
 * Check space access AND resolve role in one call.
 *
 * Usage:
 * ```ts
 * const result = await checkSpaceRole(request, slug, {
 *   getSpaceConfig: async (slug) => prisma.space.findUnique({ where: { slug } }),
 *   getMembership: async (did, slug) => prisma.spaceMember.findUnique({
 *     where: { userDID_spaceSlug: { userDID: did, spaceSlug: slug } }
 *   }),
 * });
 * if (!result.spaceAuth.allowed) return deny();
 * if (hasCapability(result.resolvedRole.role, 'create_proposal', RVOTE_PERMISSIONS)) { ... }
 * ```
 */
export declare function checkSpaceRole(request: Request, spaceSlug: string, options: SpaceRoleOptions): Promise<SpaceRoleResult>;
/**
 * HOC that wraps a Next.js API route handler with space auth + role resolution.
 *
 * Usage:
 * ```ts
 * export const POST = withSpaceRole(
 *   async (req, spaceAuth, role, slug) => {
 *     if (!hasCapability(role.role, 'create_proposal', RVOTE_PERMISSIONS)) {
 *       return Response.json({ error: 'Forbidden' }, { status: 403 });
 *     }
 *     return Response.json({ created: true });
 *   },
 *   (req) => new URL(req.url).pathname.split('/')[3], // extract slug
 *   { getSpaceConfig: ..., getMembership: ... },
 * );
 * ```
 */
export declare function withSpaceRole(handler: (request: Request, spaceAuth: SpaceAuthResult, resolvedRole: ResolvedRole, spaceSlug: string) => Promise<Response>, getSlug: (request: Request) => string, options: SpaceRoleOptions): (request: Request) => Promise<Response>;
