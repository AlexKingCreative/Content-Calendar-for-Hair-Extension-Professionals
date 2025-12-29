import { Link } from "wouter";
import { ArrowLeft, Instagram, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ashleyPhoto from "@assets/IMG_8599_3_1767022910003.JPG";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-heading font-semibold text-lg">About</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="order-2 md:order-1">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
              Meet the Creator
            </h2>
            <h3 className="text-xl text-primary font-semibold mb-2">
              Ashley Diana
            </h3>
            <p className="text-muted-foreground mb-4">
              Founder of Rich Stylist Academy
            </p>
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                Ashley Diana, known as @missashleyhair on Instagram, is a passionate advocate for hair professionals building thriving businesses. As the founder of Rich Stylist Academy, she has helped thousands of stylists grow their clientele and income.
              </p>
              <p>
                After years of coaching stylists, Ashley noticed a common struggle: staying consistent on social media. Many talented professionals felt intimidated by content creation or simply didn't know what to post.
              </p>
              <p>
                That's why she created this app - to give every stylist a complete content strategy they can follow day by day, without the stress of coming up with ideas or feeling overwhelmed.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <a 
                href="https://instagram.com/missashleyhair" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2" data-testid="link-instagram">
                  <Instagram className="w-4 h-4" />
                  @missashleyhair
                </Button>
              </a>
              <a 
                href="https://richstylist.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="gap-2" data-testid="link-richstylist">
                  <ExternalLink className="w-4 h-4" />
                  richstylist.com
                </Button>
              </a>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={ashleyPhoto} 
                  alt="Ashley Diana - Founder of Rich Stylist Academy" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
                <p className="font-heading font-semibold">@missashleyhair</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="p-8 mb-12">
          <h3 className="font-heading text-2xl font-bold text-foreground mb-6 text-center">
            Why This App Exists
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-3">For Independent Stylists</h4>
              <p className="text-muted-foreground">
                To help you stay consistent on social media so you can attract more dream clients and grow your business. No more staring at a blank screen wondering what to post - just open the app, see today's idea, and create.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-3">For Salon Owners</h4>
              <p className="text-muted-foreground">
                To create easy systems for your stylists that make posting feel exciting instead of intimidating. With team tracking and incentive rewards, you can build a culture of consistent content creation across your entire salon.
              </p>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
            Ready to transform your social media presence?
          </h3>
          <Link href="/onboarding">
            <Button size="lg" className="gap-2" data-testid="button-get-started">
              Get Started Free
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
