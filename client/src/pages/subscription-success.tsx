import { Card, CardContent } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";

export default function SubscriptionSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2" data-testid="text-success-title">
            You're All Set!
          </h1>
          
          <p className="text-muted-foreground mb-6" data-testid="text-success-message">
            Your subscription is now active. You can close this window and return to the app.
          </p>
          
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Pro Access Unlocked</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Enjoy 365 days of content ideas, AI captions, streak rewards, and more!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
