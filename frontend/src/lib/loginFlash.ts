const FLASH_KEY = 'vlh-login-flash';

export interface LoginFlash {
  enabled: boolean;
  eventSent: boolean;
  message: string;
}

export function setLoginFlash(flash: LoginFlash): void {
  sessionStorage.setItem(FLASH_KEY, JSON.stringify(flash));
}

export function consumeLoginFlash(): LoginFlash | null {
  const raw = sessionStorage.getItem(FLASH_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(FLASH_KEY);
  try {
    return JSON.parse(raw) as LoginFlash;
  } catch {
    return null;
  }
}
