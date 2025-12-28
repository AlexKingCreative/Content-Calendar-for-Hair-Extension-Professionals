// Production web URL for authentication - uses env var or falls back to current origin
const PROD_WEB_URL = import.meta.env.VITE_APP_URL || window.location.origin;

// Check if running as a native app (Capacitor)
function isNativePlatform(): boolean {
  try {
    // Check for Capacitor native platform indicators
    return !!(window as any).Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}

export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Get the login URL based on platform
export function getLoginUrl(): string {
  if (isNativePlatform()) {
    return `${PROD_WEB_URL}/api/login`;
  }
  return "/api/login";
}

// Navigate to login - handles native vs web
export function navigateToLogin() {
  const loginUrl = getLoginUrl();
  
  if (isNativePlatform()) {
    // For native apps, open in system browser
    window.open(loginUrl, '_system');
  } else {
    window.location.href = loginUrl;
  }
}

// Redirect to login with a toast notification
export function redirectToLogin(toast?: (options: { title: string; description: string; variant: string }) => void) {
  if (toast) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
  }
  setTimeout(() => {
    navigateToLogin();
  }, 500);
}
