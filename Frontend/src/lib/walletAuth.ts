const WALLET_AUTH_TOKEN_KEY = 'roastellar:wallet-auth-token';
const WALLET_ADDRESS_KEY = 'roastellar:wallet-address';

export function getWalletAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(WALLET_AUTH_TOKEN_KEY);
}

export function setWalletAuthSession(token: string, walletAddress: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WALLET_AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(WALLET_ADDRESS_KEY, walletAddress);
}

export function clearWalletAuthSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(WALLET_AUTH_TOKEN_KEY);
  window.localStorage.removeItem(WALLET_ADDRESS_KEY);
}

export function isWalletAuthenticated(): boolean {
  return Boolean(getWalletAuthToken());
}
