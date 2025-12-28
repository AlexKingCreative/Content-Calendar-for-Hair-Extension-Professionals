import { db } from "./db";
import { posts, type InsertPost, categories, contentTypes } from "@shared/schema";

type Category = typeof categories[number];
type ContentType = typeof contentTypes[number];

const postTemplates: { title: string; description: string; category: Category; contentType: ContentType }[] = [
  { title: "Before & After Transformation", description: "Showcase a stunning before and after transformation. Highlight the natural blend, added length, and volume that extensions provide.", category: "Before & After", contentType: "Reel" },
  { title: "Client Spotlight", description: "Feature a happy client and their extension journey. Share their experience and what they love about their new look.", category: "Client Spotlight", contentType: "Photo" },
  { title: "Extension Care Tips", description: "Share essential tips for maintaining healthy, beautiful extensions. Cover washing, styling, and nighttime care routines.", category: "Tips & Tricks", contentType: "Carousel" },
  { title: "Styling Tutorial", description: "Create a quick tutorial showing a beautiful hairstyle that's perfect with extensions. Step-by-step guidance for your followers.", category: "Tips & Tricks", contentType: "Reel" },
  { title: "Hair Inspiration", description: "Share inspiring hair goals and dream looks. Motivate your audience with beautiful extension transformations.", category: "Inspiration", contentType: "Photo" },
  { title: "Behind the Scenes", description: "Give followers a peek behind the curtain. Show your process, workspace, or a day in the life of an extension specialist.", category: "Behind the Scenes", contentType: "Video" },
  { title: "Extension Education", description: "Educate your audience about extension methods, maintenance, or hair health. Position yourself as the expert.", category: "Educational", contentType: "Carousel" },
  { title: "Product Recommendation", description: "Share your favorite products for extension care. Help clients maintain their investment with quality recommendations.", category: "Product Showcase", contentType: "Photo" },
  { title: "Trending Style", description: "Showcase a trending hairstyle or color that's popular right now. Show how extensions can help achieve the look.", category: "Trending", contentType: "Reel" },
  { title: "Volume Transformation", description: "Feature a dramatic volume transformation. Show how extensions can add fullness and body to thin or fine hair.", category: "Before & After", contentType: "Reel" },
  { title: "Color Blend Showcase", description: "Demonstrate your color matching expertise. Show seamless blends between natural hair and extensions.", category: "Educational", contentType: "Carousel" },
  { title: "Client Review", description: "Share a glowing client testimonial. Let your happy clients speak for you and build trust with potential clients.", category: "Client Spotlight", contentType: "Video" },
  { title: "Q&A Session", description: "Answer common questions about extensions. Address concerns and educate potential clients.", category: "Engagement", contentType: "Story" },
  { title: "Booking Reminder", description: "Remind followers about available appointments. Create urgency and encourage bookings.", category: "Promotional", contentType: "Story" },
  { title: "Hair Goals Inspiration", description: "Share dreamy hair inspiration. Help followers visualize their hair goals with extensions.", category: "Inspiration", contentType: "Carousel" },
  { title: "Method Comparison", description: "Compare different extension methods. Help clients understand which option is best for their needs.", category: "Educational", contentType: "Carousel" },
  { title: "Maintenance Tips", description: "Share tips for extending the life of extensions. Cover brushing, sleeping, and care between appointments.", category: "Tips & Tricks", contentType: "Reel" },
  { title: "Consultation Preview", description: "Show what clients can expect during a consultation. Reduce anxiety and encourage bookings.", category: "Behind the Scenes", contentType: "Video" },
  { title: "Length Transformation", description: "Showcase a dramatic length transformation. From short to long in one appointment.", category: "Before & After", contentType: "Reel" },
  { title: "Extension Myths Debunked", description: "Address common misconceptions about extensions. Educate and reassure potential clients.", category: "Educational", contentType: "Carousel" },
  { title: "Styling Versatility", description: "Show the styling versatility of extensions. Demonstrate different looks achievable with the same set.", category: "Tips & Tricks", contentType: "Reel" },
  { title: "Hair Health Tips", description: "Share tips for maintaining healthy natural hair under extensions. Show you care about overall hair health.", category: "Educational", contentType: "Carousel" },
  { title: "Special Occasion Hair", description: "Feature gorgeous special occasion hairstyles. Perfect for weddings, proms, or events.", category: "Inspiration", contentType: "Carousel" },
  { title: "Process Showcase", description: "Show your installation process. Build trust by being transparent about your technique.", category: "Behind the Scenes", contentType: "Video" },
  { title: "Texture Match", description: "Showcase your ability to match different hair textures. Demonstrate expertise with various hair types.", category: "Educational", contentType: "Reel" },
  { title: "Client Journey", description: "Share a client's extension journey over time. Show progression and long-term results.", category: "Client Spotlight", contentType: "Carousel" },
  { title: "Community Love", description: "Show appreciation for your community. Celebrate milestones, client loyalty, or follower support.", category: "Engagement", contentType: "Photo" },
  { title: "New Service Announcement", description: "Announce new services, products, or offerings. Keep your audience informed and excited.", category: "Promotional", contentType: "Photo" },
  { title: "Updo Tutorial", description: "Create a tutorial for a beautiful updo with extensions. Perfect for special events.", category: "Tips & Tricks", contentType: "Reel" },
  { title: "Natural Blend Focus", description: "Highlight seamless, natural-looking extensions. Show your attention to detail and expertise.", category: "Before & After", contentType: "Photo" },
];

function getDaysInMonth(month: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysInMonth[month - 1];
}

function getHashtags(category: Category, contentType: ContentType): string[] {
  const baseHashtags = ["#HairExtensions", "#ExtensionSpecialist", "#HairTransformation"];
  
  const categoryHashtags: Record<Category, string[]> = {
    "Before & After": ["#BeforeAndAfter", "#HairMagic", "#TransformationTuesday"],
    "Client Spotlight": ["#ClientLove", "#HappyClient", "#ClientSpotlight"],
    "Educational": ["#HairEducation", "#HairTips", "#LearnWithMe"],
    "Inspiration": ["#HairInspo", "#HairGoals", "#DreamHair"],
    "Tips & Tricks": ["#HairHacks", "#StylingTips", "#ProTips"],
    "Behind the Scenes": ["#BTS", "#SalonLife", "#HairArtist"],
    "Promotional": ["#SpecialOffer", "#BookNow", "#SalonPromo"],
    "Engagement": ["#HairCommunity", "#HairLove", "#HairFam"],
    "Product Showcase": ["#HairProducts", "#ExtensionCare", "#HairEssentials"],
    "Trending": ["#HairTrends", "#TrendingNow", "#HairTrend"],
  };
  
  const contentTypeHashtags: Record<ContentType, string[]> = {
    "Photo": ["#HairPhoto", "#HairOfTheDay"],
    "Video": ["#HairVideo", "#HairTutorial"],
    "Carousel": ["#HairCarousel", "#SwipeRight"],
    "Reel": ["#HairReels", "#ReelsTrending"],
    "Story": ["#HairStory", "#DailyHair"],
    "Live": ["#HairLive", "#LiveTutorial"],
  };
  
  return [...baseHashtags, ...categoryHashtags[category], ...contentTypeHashtags[contentType]];
}

function generatePostsForYear(): Omit<InsertPost, "id">[] {
  const allPosts: Omit<InsertPost, "id">[] = [];
  let templateIndex = 0;
  
  for (let month = 1; month <= 12; month++) {
    const daysInMonth = getDaysInMonth(month);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const template = postTemplates[templateIndex % postTemplates.length];
      const date = `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      
      const monthNames = ["January", "February", "March", "April", "May", "June", 
                          "July", "August", "September", "October", "November", "December"];
      const monthName = monthNames[month - 1];
      
      let title = template.title;
      let description = template.description;
      
      if (day === 1) {
        title = `${monthName} ${template.title}`;
        description = `Start ${monthName} strong! ${description}`;
      } else if (day === getDaysInMonth(month)) {
        title = `${monthName} Finale: ${template.title}`;
        description = `End ${monthName} with impact! ${description}`;
      } else if (day % 7 === 0) {
        title = `Weekend ${template.title}`;
      }
      
      const post: Omit<InsertPost, "id"> = {
        month,
        day,
        date,
        title,
        description,
        category: template.category,
        contentType: template.contentType,
        hashtags: getHashtags(template.category, template.contentType),
        instagramExampleUrl: templateIndex % 3 === 0 ? `https://www.instagram.com/p/example${month}_${day}/` : null,
        isAiGenerated: false,
      };
      
      allPosts.push(post);
      templateIndex++;
    }
  }
  
  return allPosts;
}

export async function seedPosts() {
  const existingPosts = await db.select().from(posts).limit(1);
  if (existingPosts.length > 0) {
    console.log("Posts already seeded, skipping...");
    return;
  }
  
  const postsToInsert = generatePostsForYear();
  
  const batchSize = 50;
  for (let i = 0; i < postsToInsert.length; i += batchSize) {
    const batch = postsToInsert.slice(i, i + batchSize);
    await db.insert(posts).values(batch);
  }
  
  console.log(`Seeded ${postsToInsert.length} posts for all 365 days`);
}
