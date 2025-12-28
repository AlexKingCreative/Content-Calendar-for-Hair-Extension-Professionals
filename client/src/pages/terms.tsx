import { Link } from "wouter";
import { ChevronLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-nav border-b safe-area-top">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h1 className="font-heading font-semibold">Terms & Conditions</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 animate-page-enter">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground">Last updated: December 28, 2025</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Content Calendar for Hair Extension Professionals ("the App"), 
            you accept and agree to be bound by the terms and provisions of this agreement. 
            If you do not agree to these terms, please do not use the App.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Content Calendar for Hair Extension Professionals is a social media content planning 
            application designed specifically for hair extension professionals. The App provides:
          </p>
          <ul>
            <li>365 days of pre-planned social media post ideas</li>
            <li>AI-powered caption generation</li>
            <li>Personalized hashtag recommendations</li>
            <li>Content filtering and organization tools</li>
            <li>Push notification reminders</li>
            <li>Posting streak tracking</li>
          </ul>

          <h2>3. User Accounts</h2>
          <p>
            To access certain features of the App, you may be required to create an account. 
            You are responsible for maintaining the confidentiality of your account credentials 
            and for all activities that occur under your account.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the App for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to the App or its systems</li>
            <li>Interfere with or disrupt the App or servers</li>
            <li>Copy, modify, or distribute App content without permission</li>
            <li>Use the App to harass, abuse, or harm others</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            The App and its original content, features, and functionality are owned by 
            Content Calendar for Hair Extension Professionals and are protected by international 
            copyright, trademark, and other intellectual property laws.
          </p>

          <h2>6. User-Generated Content</h2>
          <p>
            You retain ownership of any content you create using the App. By using our AI 
            caption generation features, you grant us permission to process your inputs to 
            provide the service.
          </p>

          <h2>7. Third-Party Services</h2>
          <p>
            The App may contain links to third-party websites or services (such as Instagram 
            examples). We are not responsible for the content or practices of these third-party sites.
          </p>

          <h2>8. Disclaimer of Warranties</h2>
          <p>
            The App is provided "as is" without warranties of any kind, either express or implied. 
            We do not guarantee that the App will be uninterrupted, error-free, or secure.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            In no event shall Content Calendar for Hair Extension Professionals be liable for 
            any indirect, incidental, special, consequential, or punitive damages resulting 
            from your use of the App.
          </p>

          <h2>10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the App 
            after changes constitutes acceptance of the new terms.
          </p>

          <h2>11. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with the laws of 
            the United States, without regard to its conflict of law provisions.
          </p>

          <h2>12. Contact</h2>
          <p>
            If you have questions about these Terms & Conditions, please contact us through 
            our <Link href="/contact" className="text-primary hover:underline">Contact page</Link>.
          </p>
        </div>
      </main>

      <footer className="border-t py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
