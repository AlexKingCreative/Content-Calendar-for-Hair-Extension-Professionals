import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, MapPin, Award, Scissors, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { certifiedBrands, extensionMethods } from "@shared/schema";

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [city, setCity] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", "/api/profile", {
        city: city || null,
        certifiedBrands: selectedBrands,
        extensionMethods: selectedMethods,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setLocation("/");
    },
  });

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleMethod = (method: string) => {
    setSelectedMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      saveMutation.mutate();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    saveMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="font-heading text-2xl">Personalize Your Experience</CardTitle>
          <CardDescription>
            Help us customize your hashtags and content recommendations
          </CardDescription>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {step} of {totalSteps}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4" data-testid="step-location">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-semibold text-lg">Your Location</h3>
              </div>
              <p className="text-muted-foreground">
                Enter your city to get location-based hashtags like #YourCityExtensions
              </p>
              <Input
                placeholder="e.g., Los Angeles, New York, Miami"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                data-testid="input-city"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4" data-testid="step-brands">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-semibold text-lg">Certified Brands</h3>
              </div>
              <p className="text-muted-foreground">
                Select the hair extension brands you're certified in
              </p>
              <div className="flex flex-wrap gap-2">
                {certifiedBrands.map((brand) => (
                  <Badge
                    key={brand}
                    variant={selectedBrands.includes(brand) ? "default" : "outline"}
                    className="cursor-pointer py-2 px-3"
                    onClick={() => toggleBrand(brand)}
                    data-testid={`badge-brand-${brand.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {selectedBrands.includes(brand) && <Check className="w-3 h-3 mr-1" />}
                    {brand}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4" data-testid="step-methods">
              <div className="flex items-center gap-2 mb-4">
                <Scissors className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-semibold text-lg">Extension Methods</h3>
              </div>
              <p className="text-muted-foreground">
                Select the extension methods you specialize in
              </p>
              <div className="flex flex-wrap gap-2">
                {extensionMethods.map((method) => (
                  <Badge
                    key={method}
                    variant={selectedMethods.includes(method) ? "default" : "outline"}
                    className="cursor-pointer py-2 px-3"
                    onClick={() => toggleMethod(method)}
                    data-testid={`badge-method-${method.toLowerCase().replace(/[\s\-]+/g, "-")}`}
                  >
                    {selectedMethods.includes(method) && <Check className="w-3 h-3 mr-1" />}
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <div>
              {step > 1 ? (
                <Button variant="ghost" onClick={handleBack} data-testid="button-back">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              ) : (
                <Button variant="ghost" onClick={handleSkip} data-testid="button-skip">
                  Skip for now
                </Button>
              )}
            </div>
            <Button onClick={handleNext} disabled={saveMutation.isPending} data-testid="button-next">
              {saveMutation.isPending ? (
                "Saving..."
              ) : step === totalSteps ? (
                <>
                  Get Started
                  <Check className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
