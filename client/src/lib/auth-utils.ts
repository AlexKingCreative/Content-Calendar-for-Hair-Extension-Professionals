const PROD_WEB_URL = import.meta.env.VITE_APP_URL || window.location.origin;

export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function getLoginUrl(): string {
  return "/api/login";
}

export async function navigateToLogin() {
  window.location.href = getLoginUrl();
}

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
