import { Camera, Video, Film, Images, Clock, Radio, X, Filter, SlidersHorizontal, GraduationCap, ArrowLeftRight, Clapperboard, Star, ShoppingBag, Megaphone, MessageCircle, Sparkles, Lightbulb, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { type Category, type ContentType, categories, contentTypes } from "@shared/schema";

const contentTypeIcons: Record<ContentType, typeof Camera> = {
  Photo: Camera,
  Video: Video,
  Reel: Film,
  Carousel: Images,
  Story: Clock,
  Live: Radio,
};

const categoryIcons: Record<Category, typeof Camera> = {
  Educational: GraduationCap,
  "Before & After": ArrowLeftRight,
  "Behind the Scenes": Clapperboard,
  "Client Spotlight": Star,
  "Product Showcase": ShoppingBag,
  Promotional: Megaphone,
  Engagement: MessageCircle,
  Inspiration: Sparkles,
  "Tips & Tricks": Lightbulb,
  Trending: TrendingUp,
};

const categoryColors: Record<Category, string> = {
  Educational: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50",
  "Before & After": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50",
  "Behind the Scenes": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50",
  "Client Spotlight": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-900/50",
  "Product Showcase": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50",
  Promotional: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50",
  Engagement: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-900/50",
  Inspiration: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50",
  "Tips & Tricks": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50",
  Trending: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/50",
};

interface FilterControlsProps {
  selectedCategories: Category[];
  setSelectedCategories: (categories: Category[]) => void;
  selectedContentTypes: ContentType[];
  setSelectedContentTypes: (types: ContentType[]) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  postCount: number;
  onApply?: () => void;
}

export default function FilterControls({
  selectedCategories,
  setSelectedCategories,
  selectedContentTypes,
  setSelectedContentTypes,
  hasActiveFilters,
  clearFilters,
  postCount,
  onApply,
}: FilterControlsProps) {
  const toggleCategory = (category: Category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleContentType = (type: ContentType) => {
    if (selectedContentTypes.includes(type)) {
      setSelectedContentTypes(selectedContentTypes.filter((t) => t !== type));
    } else {
      setSelectedContentTypes([...selectedContentTypes, type]);
    }
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading font-medium text-foreground mb-3">
          Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            const CategoryIcon = categoryIcons[category];
            return (
              <Badge
                key={category}
                variant={isSelected ? "default" : "secondary"}
                onClick={() => toggleCategory(category)}
                className={`cursor-pointer px-3 py-1.5 text-sm font-medium gap-1.5 ${
                  isSelected
                    ? categoryColors[category]
                    : "hover:bg-accent"
                }`}
                data-testid={`filter-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <CategoryIcon className="w-3.5 h-3.5" />
                {category}
              </Badge>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="font-heading font-medium text-foreground mb-3">
          Content Types
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {contentTypes.map((type) => {
            const Icon = contentTypeIcons[type];
            const isSelected = selectedContentTypes.includes(type);
            return (
              <Button
                key={type}
                variant={isSelected ? "default" : "outline"}
                onClick={() => toggleContentType(type)}
                className={`flex flex-col items-center gap-1.5 h-auto py-3 touch-target ${
                  isSelected ? "" : "text-muted-foreground"
                }`}
                data-testid={`filter-content-type-${type.toLowerCase()}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{type}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {onApply && (
        <div className="pt-4 border-t mt-6">
          <Button onClick={onApply} className="w-full touch-target" data-testid="button-apply-filters">
            Show {postCount} post{postCount !== 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="hidden lg:block">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="font-heading font-medium text-foreground">
              Filters
            </span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {selectedCategories.length + selectedContentTypes.length} active
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              data-testid="button-clear-filters"
            >
              <X className="w-4 h-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>
        <FilterContent />
      </div>

      <div className="lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {postCount} posts
            </span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {selectedCategories.length + selectedContentTypes.length} filters
              </Badge>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-open-filters">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle className="font-heading">Filters</SheetTitle>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      data-testid="button-clear-filters-mobile"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear all
                    </Button>
                  )}
                </div>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
