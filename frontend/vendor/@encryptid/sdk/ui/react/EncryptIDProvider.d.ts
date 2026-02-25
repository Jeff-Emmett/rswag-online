/**
 * EncryptID React Context Provider
 *
 * Wraps your app to provide EncryptID auth state to all components.
 * Features: localStorage + cookie persistence, auto-refresh, session verification on mount.
 */
import React, { type ReactNode } from 'react';
import { EncryptIDClient } from '../../client/api-client.js';
import type { EncryptIDClaims } from '../../types/index.js';
interface EncryptIDContextValue {
    /** Whether the user is authenticated */
    isAuthenticated: boolean;
    /** JWT token (null if not authenticated) */
    token: string | null;
    /** Decoded claims (null if not authenticated) */
    claims: EncryptIDClaims | null;
    /** User's DID (null if not authenticated) */
    did: string | null;
    /** Username from EncryptID */
    username: string | null;
    /** Whether auth state is being loaded */
    loading: boolean;
    /** Full registration + authentication flow */
    register: (username: string, displayName?: string) => Promise<void>;
    /** Full authentication flow */
    login: (credentialId?: string) => Promise<void>;
    /** Clear session */
    logout: () => void;
    /** The EncryptID API client */
    client: EncryptIDClient;
}
interface EncryptIDProviderProps {
    children: ReactNode;
    /** EncryptID server URL (default: https://encryptid.jeffemmett.com) */
    serverUrl?: string;
}
export declare function EncryptIDProvider({ children, serverUrl }: EncryptIDProviderProps): React.FunctionComponentElement<React.ProviderProps<EncryptIDContextValue | null>>;
export declare function useEncryptID(): EncryptIDContextValue;
export {};
