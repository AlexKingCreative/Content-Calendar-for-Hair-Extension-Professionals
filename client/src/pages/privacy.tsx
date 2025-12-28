import { Link } from "wouter";
import { ChevronLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
            <h1 className="font-heading font-semibold">Privacy Policy</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 animate-page-enter">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground">Last updated: December 28, 2025</p>

          <h2>1. Introduction</h2>
          <p>
            Content Calendar for Hair Pros ("we," "our," or "the App") 
            is committed to protecting your privacy. This Privacy Policy explains how we 
            collect, use, disclose, and safeguard your information when you use our application.
          </p>

          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> When you create an account, we collect your name and authentication credentials through Replit authentication.</li>
            <li><strong>Profile Information:</strong> City/location, certified brands, and extension methods you work with.</li>
            <li><strong>Usage Data:</strong> Your posting streaks, goals, and interaction with content.</li>
          </ul>

          <h3>2.2 Automatically Collected Information</h3>
          <ul>
            <li>Device type and browser information</li>
            <li>Usage patterns and feature interactions</li>
            <li>Push notification preferences</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain the App</li>
            <li>Personalize your hashtag recommendations based on your location and certifications</li>
            <li>Generate AI-powered captions tailored to your voice and tone preferences</li>
            <li>Send push notifications for daily posting reminders</li>
            <li>Track and display your posting streaks and achievements</li>
            <li>Improve and optimize the App</li>
          </ul>

          <h2>4. AI-Powered Features</h2>
          <p>
            Our App uses OpenAI's technology to generate personalized captions. When you use 
            this feature:
          </p>
          <ul>
            <li>Your post idea and profile preferences are sent to OpenAI for processing</li>
            <li>Generated captions are not stored by OpenAI for training purposes</li>
            <li>You retain full ownership of generated content</li>
          </ul>

          <h2>5. Data Sharing</h2>
          <p>We do not sell your personal information. We may share data with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Third parties that help us operate the App (hosting, authentication)</li>
            <li><strong>AI Services:</strong> OpenAI for caption generation (data is not retained)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          </ul>

          <h2>6. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect 
            your information. However, no method of transmission over the Internet is 100% secure.
          </p>

          <h2>7. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active or as 
            needed to provide you services. You can request deletion of your account at any time.
          </p>

          <h2>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of push notifications</li>
            <li>Export your data</li>
          </ul>

          <h2>9. Cookies and Local Storage</h2>
          <p>
            We use local storage to save your preferences and session information. 
            This helps us provide a better user experience and remember your settings.
          </p>

          <h2>10. Children's Privacy</h2>
          <p>
            The App is not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any 
            changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2>12. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, please 
            contact us through our <Link href="/contact" className="text-primary hover:underline">Contact page</Link>.
          </p>
        </div>
      </main>

      <footer className="border-t py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
