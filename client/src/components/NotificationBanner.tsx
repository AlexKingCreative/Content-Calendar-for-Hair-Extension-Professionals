import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function NotificationBanner() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { toast } = useToast();

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }
    
    const dismissed = localStorage.getItem("notification-banner-dismissed");
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  }

  async function subscribe() {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const response = await fetch("/api/push/vapid-public-key");
      const { publicKey } = await response.json();
      
      if (!publicKey) {
        throw new Error("VAPID public key not configured");
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await apiRequest("/api/push/subscribe", "POST", {
        subscription: subscription.toJSON(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      setIsSubscribed(true);
      setPermission("granted");
      toast({
        title: "Notifications enabled",
        description: "You'll receive daily reminders for your content calendar.",
      });
    } catch (error: any) {
      console.error("Error subscribing:", error);
      if (Notification.permission === "denied") {
        setPermission("denied");
        toast({
          variant: "destructive",
          title: "Notifications blocked",
          description: "Please enable notifications in your browser settings.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Subscription failed",
          description: "Could not enable notifications. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribe() {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await apiRequest("/api/push/unsubscribe", "DELETE", {
          endpoint: subscription.endpoint,
        });
      }

      setIsSubscribed(false);
      toast({
        title: "Notifications disabled",
        description: "You won't receive daily reminders anymore.",
      });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not disable notifications. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function dismiss() {
    setIsDismissed(true);
    localStorage.setItem("notification-banner-dismissed", "true");
  }

  if (!isSupported || isDismissed || permission === "denied") {
    return null;
  }

  if (isSubscribed) {
    return (
      <Card className="p-3 flex items-center justify-between gap-2 bg-accent/30">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <span className="text-sm">Daily notifications enabled</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={unsubscribe}
          disabled={isLoading}
          data-testid="button-disable-notifications"
        >
          <BellOff className="h-4 w-4" />
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 flex-1">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">Get daily reminders to post your content</span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          onClick={subscribe}
          disabled={isLoading}
          data-testid="button-enable-notifications"
        >
          Enable
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={dismiss}
          data-testid="button-dismiss-notification-banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
