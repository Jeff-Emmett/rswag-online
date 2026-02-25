/**
 * EncryptID Auth Store for rSwag
 *
 * Optional authentication via WebAuthn passkeys.
 * Zustand with localStorage persistence, delegates WebAuthn ceremony to @encryptid/sdk.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EncryptIDClient } from '@encryptid/sdk/client';

const ENCRYPTID_SERVER = process.env.NEXT_PUBLIC_ENCRYPTID_SERVER_URL || 'https://auth.ridentity.online';
const client = new EncryptIDClient(ENCRYPTID_SERVER);

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  did: string | null;
  username: string | null;
  loading: boolean;

  login: () => Promise<void>;
  register: (username: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      did: null,
      username: null,
      loading: false,

      login: async () => {
        set({ loading: true });
        try {
          const result = await client.authenticate();
          document.cookie = `encryptid_token=${result.token};path=/;max-age=900;SameSite=Lax`;
          set({
            isAuthenticated: true,
            token: result.token,
            did: result.did,
            username: result.username,
            loading: false,
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      register: async (username: string) => {
        set({ loading: true });
        try {
          const result = await client.register(username);
          document.cookie = `encryptid_token=${result.token};path=/;max-age=900;SameSite=Lax`;
          set({
            isAuthenticated: true,
            token: result.token,
            did: result.did,
            username,
            loading: false,
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: () => {
        document.cookie = 'encryptid_token=;path=/;max-age=0;SameSite=Lax';
        set({
          isAuthenticated: false,
          token: null,
          did: null,
          username: null,
          loading: false,
        });
      },
    }),
    {
      name: 'rswag-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        did: state.did,
        username: state.username,
      }),
    }
  )
);
