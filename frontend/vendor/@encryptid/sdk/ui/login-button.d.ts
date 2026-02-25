/**
 * EncryptID Login Button Web Component
 *
 * Custom element: <encryptid-login>
 * Attributes: size (small|medium|large), variant (primary|outline), label, show-user
 * Events: login-success, login-error, login-register-needed, logout, auth-upgraded
 */
export declare class EncryptIDLoginButton extends HTMLElement {
    private shadow;
    private loading;
    private showDropdown;
    private capabilities;
    static get observedAttributes(): string[];
    constructor();
    connectedCallback(): Promise<void>;
    attributeChangedCallback(): void;
    private get size();
    private get variant();
    private get label();
    private get showUser();
    private render;
    private renderLoginButton;
    private renderUserInfo;
    private renderDropdown;
    private attachEventListeners;
    private handleLogin;
    private handleDropdownAction;
    private startConditionalAuth;
    register(username: string, displayName: string): Promise<void>;
}
