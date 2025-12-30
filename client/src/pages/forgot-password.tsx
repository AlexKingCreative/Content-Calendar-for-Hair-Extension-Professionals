import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar, ArrowLeft, Loader2, Mail, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/request-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send reset email");
      }

      setEmailSent(true);
      toast({
        title: "Check your email!",
        description: "We've sent you a link to reset your password.",
      });
    } catch (error: any) {
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-lg hidden sm:block">Content Calendar</span>
            </div>
          </Link>
          
          <Link href="/login">
            <Button variant="ghost" size="sm" data-testid="button-back-login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a link to sign in
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Check your email</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  We've sent you a magic link. Click the link to sign in and then update your password in account settings.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setEmailSent(false)}
                  data-testid="button-try-again"
                >
                  Send another link
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            data-testid="input-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <p className="text-sm text-muted-foreground">
                    We'll send you a magic link to sign in. Once signed in, you can update your password in account settings.
                  </p>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                    data-testid="button-send-reset-link"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link href="/login">
                <span className="text-primary font-medium hover:underline cursor-pointer">
                  Sign in
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
