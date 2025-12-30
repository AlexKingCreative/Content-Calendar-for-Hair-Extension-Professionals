import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronDown, ChevronUp, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MobileNav } from "@/components/MobileNav";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How do I use the content calendar?",
    answer: "Navigate to the Calendar tab to see monthly pre-planned post ideas. Each day has a unique post suggestion with title, description, category, and hashtags. Tap any day to see the full details and generate a personalized AI caption."
  },
  {
    question: "How does streak tracking work?",
    answer: "Your streak counts consecutive days you've posted content. When you post on social media, tap the 'I Posted Today' button to log it. Keep your streak going by posting every day - you'll earn badges at milestones like 7, 14, 30, 60, and 90 days!"
  },
  {
    question: "What are the AI-generated captions?",
    answer: "Our AI creates personalized captions based on your profile settings - your voice preference (I/me for solo stylists or we/us for salons), your city for local hashtags, and the brands and services you offer. Each caption is unique and tailored to your business."
  },
  {
    question: "How do hashtags work?",
    answer: "Each post comes with suggested hashtags relevant to the content. When you set your city in your profile, we automatically add location-based hashtags. Tap any hashtag set to copy it to your clipboard for easy pasting into Instagram."
  },
  {
    question: "What is the 'I Posted Today' button?",
    answer: "This button lets you log that you've posted content for the day. It updates your streak counter and tracks your consistency. You can only log once per day, and it resets at midnight in your timezone."
  },
  {
    question: "How do posting challenges work?",
    answer: "Challenges are time-limited goals to help boost your posting consistency. Start a challenge from the Streaks tab, then log your posts daily during the challenge period. Complete the required number of posts to earn the challenge badge!"
  },
  {
    question: "What are trend alerts?",
    answer: "Trend alerts notify you about timely content opportunities - seasonal themes, holidays, or viral trends in the hair industry. They appear in the Trends tab and expire after 7 days, so act fast on ones that fit your content style."
  },
  {
    question: "How do I download the calendar as PDF?",
    answer: "On the Calendar page, tap the download icon in the header. This generates a printable PDF of the month's content plan that you can save or print for offline reference."
  },
  {
    question: "My posts aren't logging - what should I do?",
    answer: "Make sure you're signed in and have completed your profile setup. If the button still doesn't work, try closing and reopening the app. You can only log one post per day, so check if you've already logged today."
  },
  {
    question: "How do I contact support?",
    answer: "For help with your account, billing questions, or feature requests, email us at support@contentcalendarforhairpros.com. We typically respond within 24-48 hours."
  }
];

export default function HelpPage() {
  const [, setLocation] = useLocation();
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const { data: user } = useQuery<{ id: string } | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="min-h-screen bg-background pb-24 sm:pb-8">
      <header className="sticky top-0 z-50 glass-header">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/settings")}
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-heading text-lg font-semibold" data-testid="text-page-title">
            Help & Support
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="space-y-2">
          <h2 className="font-heading text-xl font-semibold" data-testid="text-faq-title">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted-foreground">
            Find answers to common questions about using the app
          </p>
        </div>

        <div className="space-y-3">
          {faqData.map((faq, index) => (
            <Card key={index} className="overflow-hidden">
              <Collapsible open={openItems.has(index)} onOpenChange={() => toggleItem(index)}>
                <CollapsibleTrigger asChild>
                  <button
                    className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover-elevate"
                    data-testid={`button-faq-${index}`}
                  >
                    <span className="font-medium text-sm">{faq.question}</span>
                    {openItems.has(index) ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4 px-4">
                    <p 
                      className="text-sm text-muted-foreground leading-relaxed"
                      data-testid={`text-faq-answer-${index}`}
                    >
                      {faq.answer}
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm" data-testid="text-contact-title">
                Still need help?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Contact our support team for personalized assistance
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => window.open("mailto:support@contentcalendarforhairpros.com", "_blank")}
                data-testid="button-contact-support"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Support
              </Button>
            </div>
          </div>
        </Card>

        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            App Version: 2025.2
          </p>
        </div>
      </main>

      <MobileNav isLoggedIn={!!user} />
    </div>
  );
}
