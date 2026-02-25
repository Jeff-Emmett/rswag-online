/**
 * EncryptID Login Button — React Component
 *
 * Wraps the EncryptID client for easy React integration.
 */
import React from 'react';
interface LoginButtonProps {
    /** Button label (default: "Sign in with Passkey") */
    label?: string;
    /** Button size */
    size?: 'small' | 'medium' | 'large';
    /** Visual variant */
    variant?: 'primary' | 'outline';
    /** Callback after successful login */
    onSuccess?: (result: {
        token: string;
        did: string;
    }) => void;
    /** Callback on error */
    onError?: (error: Error) => void;
    /** Callback when registration is needed */
    onRegisterNeeded?: () => void;
    /** Additional CSS class */
    className?: string;
}
export declare function LoginButton({ label, size, variant, onSuccess, onError, onRegisterNeeded, className, }: LoginButtonProps): React.DetailedReactHTMLElement<{
    onClick: () => Promise<void>;
    disabled: boolean;
    style: React.CSSProperties;
    className: string;
}, HTMLElement>;
export {};
