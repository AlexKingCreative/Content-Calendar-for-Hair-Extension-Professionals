import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("install-prompt-dismissed");
    if (dismissed) return;

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setIsVisible(false);
    } catch (error) {
      console.error("Install prompt error:", error);
    }
  }

  function handleDismiss() {
    setIsVisible(false);
    localStorage.setItem("install-prompt-dismissed", "true");
  }

  if (!isVisible || isInstalled) return null;

  return (
    <Card className="fixed bottom-20 left-4 right-4 p-4 z-40 shadow-lg sm:left-auto sm:right-4 sm:w-80">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-md bg-primary flex items-center justify-center">
          <Download className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm">Install App</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add to your home screen for quick access
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" onClick={handleInstall} data-testid="button-install-app">
              Install
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDismiss} data-testid="button-dismiss-install">
              Not now
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0"
          onClick={handleDismiss}
          data-testid="button-close-install-prompt"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
