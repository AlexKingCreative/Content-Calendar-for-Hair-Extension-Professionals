import { db } from "./db";
import { posts, type InsertPost, categories, contentTypes } from "@shared/schema";

const contentData: Omit<InsertPost, "hashtags">[] = [
  { month: 1, day: 1, date: "2025-01-01", title: "New Year, New Hair Goals", description: "Inspire your clients with fresh hair transformation ideas for the new year. Share before/after photos of dramatic length changes and encourage bookings for January.", category: "Inspiration", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C1example1/" },
  { month: 1, day: 3, date: "2025-01-03", title: "Winter Hair Care Tips", description: "Educate your audience on how to protect hair extensions during cold, dry winter months. Cover moisturizing tips, static prevention, and nighttime care routines.", category: "Educational", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C1example2/" },
  { month: 1, day: 5, date: "2025-01-05", title: "Meet the Team Monday", description: "Introduce your stylists and their specialties. Show personality and build trust with potential clients by featuring team members and their favorite extension techniques.", category: "Behind the Scenes", contentType: "Video", instagramExampleUrl: "https://www.instagram.com/p/C1example3/" },
  { month: 1, day: 7, date: "2025-01-07", title: "Length Transformation Reveal", description: "Showcase a stunning before and after of a client going from short to long with seamless extensions. Highlight the natural blend and quality of work.", category: "Before & After", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C1example4/" },
  { month: 1, day: 9, date: "2025-01-09", title: "Extension Method Explained: Tape-Ins", description: "Create an informative post breaking down tape-in extensions - how they work, ideal candidates, maintenance schedule, and longevity expectations.", category: "Educational", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C1example5/" },
  { month: 1, day: 11, date: "2025-01-11", title: "Client Spotlight: Sarah's Journey", description: "Feature a loyal client's hair extension journey over time. Share their story, favorite looks, and testimonial about their experience with your services.", category: "Client Spotlight", contentType: "Video", instagramExampleUrl: "https://www.instagram.com/p/C1example6/" },
  { month: 1, day: 13, date: "2025-01-13", title: "Weekend Booking Reminder", description: "Encourage last-minute weekend bookings with an engaging post about availability. Include a call-to-action for consultations and touch-up appointments.", category: "Promotional", contentType: "Story", instagramExampleUrl: null },
  { month: 1, day: 15, date: "2025-01-15", title: "Poll: Favorite Extension Length", description: "Create an interactive poll asking followers about their preferred extension length. Use results to understand your audience and plan future content.", category: "Engagement", contentType: "Story", instagramExampleUrl: null },
  { month: 1, day: 17, date: "2025-01-17", title: "Blonde Extension Color Matching", description: "Demonstrate the art of matching blonde extension shades to natural hair. Show the importance of undertones and highlight blending techniques.", category: "Educational", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C1example7/" },
  { month: 1, day: 19, date: "2025-01-19", title: "Styling Tips: Waves with Extensions", description: "Share a quick tutorial on creating beautiful waves with hair extensions. Cover heat protection, sectioning, and finishing techniques.", category: "Tips & Tricks", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C1example8/" },
  { month: 1, day: 21, date: "2025-01-21", title: "Premium Hair Quality Showcase", description: "Highlight the quality of hair products you use. Show texture, shine, and durability to educate clients on why quality matters for extensions.", category: "Product Showcase", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C1example9/" },
  { month: 1, day: 23, date: "2025-01-23", title: "Extension Removal Process", description: "Demystify the extension removal process with a behind-the-scenes look. Show how gentle and damage-free proper removal can be.", category: "Behind the Scenes", contentType: "Video", instagramExampleUrl: "https://www.instagram.com/p/C1example10/" },
  { month: 1, day: 25, date: "2025-01-25", title: "January Special Offer", description: "Announce a limited-time January promotion for new clients. Create urgency with countdown and highlight the value of the offer.", category: "Promotional", contentType: "Photo", instagramExampleUrl: null },
  { month: 1, day: 27, date: "2025-01-27", title: "Trending: Curtain Bangs with Extensions", description: "Showcase how to add curtain bangs using extensions for clients who want the look without commitment. Cover styling and blending tips.", category: "Trending", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C1example11/" },
  { month: 1, day: 29, date: "2025-01-29", title: "Q&A: Extension Myths Debunked", description: "Address common misconceptions about hair extensions. Cover topics like damage, maintenance requirements, and longevity in an engaging Q&A format.", category: "Educational", contentType: "Live", instagramExampleUrl: null },
  { month: 1, day: 31, date: "2025-01-31", title: "Month-End Transformation Gallery", description: "Compile the best transformations from January into a stunning carousel. Celebrate your work and inspire potential clients.", category: "Before & After", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C1example12/" },
  
  { month: 2, day: 1, date: "2025-02-01", title: "February Self-Love Month", description: "Kick off the month with a message about self-care and treating yourself to the hair you've always wanted. Encourage bookings for Valentine's preparations.", category: "Inspiration", contentType: "Photo", instagramExampleUrl: "https://www.instagram.com/p/C2example1/" },
  { month: 2, day: 3, date: "2025-02-03", title: "Valentine's Day Hair Ideas", description: "Showcase romantic hairstyles perfect for Valentine's Day dates. Include soft waves, elegant updos, and flowing lengths using extensions.", category: "Inspiration", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C2example2/" },
  { month: 2, day: 5, date: "2025-02-05", title: "Red & Rose Gold Extensions", description: "Feature stunning red and rose gold extension colors perfect for the season of love. Show various shades and how they complement different skin tones.", category: "Product Showcase", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C2example3/" },
  { month: 2, day: 7, date: "2025-02-07", title: "Client Love Stories", description: "Share testimonials from clients about how their new hair made them feel confident. Focus on emotional transformations alongside physical ones.", category: "Client Spotlight", contentType: "Video", instagramExampleUrl: "https://www.instagram.com/p/C2example4/" },
  { month: 2, day: 9, date: "2025-02-09", title: "Date Night Styling Tutorial", description: "Create a step-by-step tutorial for a glamorous date night look using extensions. Cover volume, curls, and finishing touches.", category: "Tips & Tricks", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C2example5/" },
  { month: 2, day: 11, date: "2025-02-11", title: "This or That: Extension Styles", description: "Create an engaging interactive post asking followers to choose between different extension styles, lengths, or colors.", category: "Engagement", contentType: "Story", instagramExampleUrl: null },
  { month: 2, day: 13, date: "2025-02-13", title: "Valentine's Week Special", description: "Announce a Valentine's week promotion for couples or self-love packages. Include consultation and styling services.", category: "Promotional", contentType: "Photo", instagramExampleUrl: null },
  { month: 2, day: 14, date: "2025-02-14", title: "Happy Valentine's Day", description: "Send love to your clients and followers with a heartfelt Valentine's message. Share appreciation for their support and loyalty.", category: "Engagement", contentType: "Story", instagramExampleUrl: null },
  { month: 2, day: 16, date: "2025-02-16", title: "Ponytail Extension Transformation", description: "Showcase the power of ponytail extensions for instant glamour. Demonstrate before/after of a sleek, voluminous ponytail.", category: "Before & After", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C2example6/" },
  { month: 2, day: 18, date: "2025-02-18", title: "Extension Method: Hand-Tied Wefts", description: "Educate your audience on hand-tied weft extensions - the benefits, installation process, and why they're becoming increasingly popular.", category: "Educational", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C2example7/" },
  { month: 2, day: 20, date: "2025-02-20", title: "Salon Tour: Where Magic Happens", description: "Give followers a virtual tour of your salon space. Show the ambiance, products, and tools that create beautiful transformations.", category: "Behind the Scenes", contentType: "Video", instagramExampleUrl: "https://www.instagram.com/p/C2example8/" },
  { month: 2, day: 22, date: "2025-02-22", title: "Bridal Hair Consultation Tips", description: "Share advice for brides-to-be considering extensions for their wedding day. Cover timeline, trials, and what to expect.", category: "Tips & Tricks", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C2example9/" },
  { month: 2, day: 24, date: "2025-02-24", title: "Dimensional Brunette Extensions", description: "Showcase the beauty of dimensional brunette extensions with lowlights and highlights. Demonstrate color blending techniques.", category: "Product Showcase", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C2example10/" },
  { month: 2, day: 26, date: "2025-02-26", title: "Extension Care Product Favorites", description: "Share your recommended products for extension care - shampoos, conditioners, oils, and tools that keep extensions looking their best.", category: "Product Showcase", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C2example11/" },
  { month: 2, day: 28, date: "2025-02-28", title: "February Favorites Recap", description: "Share the most popular looks and transformations from February. Celebrate the month's successes and client wins.", category: "Before & After", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C2example12/" },
  
  { month: 3, day: 1, date: "2025-03-01", title: "Spring Hair Refresh", description: "Welcome spring with fresh hair inspiration. Encourage clients to update their look with new extensions, colors, or lengths for the season.", category: "Inspiration", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C3example1/" },
  { month: 3, day: 5, date: "2025-03-05", title: "Honey Blonde Spring Trend", description: "Showcase the trending honey blonde shade perfect for spring. Demonstrate how extensions can add dimension and warmth.", category: "Trending", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C3example2/" },
  { month: 3, day: 10, date: "2025-03-10", title: "Extension Consultation: What to Expect", description: "Walk potential clients through the consultation process. Cover questions asked, assessment done, and recommendations made.", category: "Educational", contentType: "Video", instagramExampleUrl: "https://www.instagram.com/p/C3example3/" },
  { month: 3, day: 15, date: "2025-03-15", title: "Ask Me Anything: Extensions", description: "Host a live Q&A session answering follower questions about extensions. Cover common concerns and provide expert advice.", category: "Engagement", contentType: "Live", instagramExampleUrl: null },
  { month: 3, day: 20, date: "2025-03-20", title: "First Day of Spring Celebration", description: "Celebrate the official start of spring with bright, fresh content. Encourage new beginnings with new hair looks.", category: "Inspiration", contentType: "Photo", instagramExampleUrl: "https://www.instagram.com/p/C3example4/" },
  { month: 3, day: 25, date: "2025-03-25", title: "Client Appreciation Post", description: "Show gratitude to your loyal clients with a heartfelt appreciation post. Feature multiple client photos with their permission.", category: "Client Spotlight", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C3example5/" },
  { month: 3, day: 31, date: "2025-03-31", title: "March Transformation Gallery", description: "Compile the best spring transformations from March. Celebrate seasonal changes and beautiful results.", category: "Before & After", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C3example6/" },
  
  { month: 4, day: 1, date: "2025-04-01", title: "April Fresh Starts", description: "Welcome April with inspiration for new hair journeys. Encourage clients to take the leap with extensions they've been considering.", category: "Inspiration", contentType: "Photo", instagramExampleUrl: "https://www.instagram.com/p/C4example1/" },
  { month: 4, day: 7, date: "2025-04-07", title: "Client Journey: 1 Year with Extensions", description: "Feature a client's one-year extension journey. Show progression, different styles, and their experience over time.", category: "Client Spotlight", contentType: "Video", instagramExampleUrl: "https://www.instagram.com/p/C4example2/" },
  { month: 4, day: 15, date: "2025-04-15", title: "Spring Wedding Hair Preview", description: "Showcase bridal extension styles for spring weddings. Feature romantic, soft looks perfect for the season.", category: "Inspiration", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C4example3/" },
  { month: 4, day: 20, date: "2025-04-20", title: "Volume Transformation Saturday", description: "Showcase a dramatic volume transformation - thin to thick hair using extensions. Highlight the confidence boost.", category: "Before & After", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C4example4/" },
  { month: 4, day: 25, date: "2025-04-25", title: "Extension Types Comparison", description: "Create a comprehensive comparison of extension methods available. Help potential clients understand their options.", category: "Educational", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C4example5/" },
  { month: 4, day: 30, date: "2025-04-30", title: "April Highlights Reel", description: "Compile the month's best moments, transformations, and client wins into an engaging highlights reel.", category: "Before & After", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C4example6/" },
  
  { month: 5, day: 1, date: "2025-05-01", title: "May Day Hair Celebration", description: "Welcome May with celebration of spring beauty. Feature fresh, floral-inspired hair looks and styling ideas.", category: "Inspiration", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C5example1/" },
  { month: 5, day: 5, date: "2025-05-05", title: "Glamorous Mom Makeover", description: "Feature a mom transformation with extensions. Show the confidence and joy of refreshed, beautiful hair.", category: "Before & After", contentType: "Video", instagramExampleUrl: "https://www.instagram.com/p/C5example2/" },
  { month: 5, day: 11, date: "2025-05-11", title: "Happy Mother's Day", description: "Send heartfelt Mother's Day wishes to all the amazing moms in your community. Celebrate their beauty.", category: "Engagement", contentType: "Photo", instagramExampleUrl: null },
  { month: 5, day: 15, date: "2025-05-15", title: "Beachy Waves Tutorial", description: "Create a tutorial for achieving perfect beachy waves with extensions. Cover techniques and products.", category: "Tips & Tricks", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C5example3/" },
  { month: 5, day: 20, date: "2025-05-20", title: "Summer-Ready Hair Prep", description: "Start preparing clients for summer with tips on maintaining extensions in heat and humidity.", category: "Educational", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C5example4/" },
  { month: 5, day: 25, date: "2025-05-25", title: "Copper Tones for Summer", description: "Showcase trending copper and auburn extension shades perfect for the upcoming summer season.", category: "Trending", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C5example5/" },
  { month: 5, day: 31, date: "2025-05-31", title: "May Transformation Gallery", description: "Compile the best transformations from May. Celebrate the month's beautiful results.", category: "Before & After", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C5example6/" },
  
  { month: 6, day: 1, date: "2025-06-01", title: "Hello Summer Hair", description: "Welcome summer with hot weather hair inspiration. Feature protective styles and low-maintenance looks.", category: "Inspiration", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C6example1/" },
  { month: 6, day: 10, date: "2025-06-10", title: "Pool & Beach Hair Care", description: "Share essential tips for protecting extensions at the pool and beach. Cover chlorine and saltwater care.", category: "Tips & Tricks", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C6example2/" },
  { month: 6, day: 15, date: "2025-06-15", title: "Festival Hair Ideas", description: "Showcase fun festival-ready hairstyles with extensions. Feature braids, accessories, and bold looks.", category: "Inspiration", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C6example3/" },
  { month: 6, day: 21, date: "2025-06-21", title: "Summer Solstice Celebration", description: "Celebrate the longest day of the year with sun-kissed hair inspiration and summer vibes.", category: "Engagement", contentType: "Photo", instagramExampleUrl: null },
  { month: 6, day: 25, date: "2025-06-25", title: "Vacation Hair Prep", description: "Help clients prepare their extensions for vacation travel. Cover packing tips and destination styling.", category: "Tips & Tricks", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C6example4/" },
  { month: 6, day: 30, date: "2025-06-30", title: "June Highlights", description: "Share the month's best summer transformations and memorable moments.", category: "Before & After", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C6example5/" },
  
  { month: 7, day: 1, date: "2025-07-01", title: "Fourth of July Hair", description: "Feature patriotic-themed hair styling ideas for Independence Day celebrations.", category: "Inspiration", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C7example1/" },
  { month: 7, day: 10, date: "2025-07-10", title: "Summer Wedding Season", description: "Showcase gorgeous summer wedding hair with extensions. Feature elegant updos and flowing styles.", category: "Inspiration", contentType: "Video", instagramExampleUrl: "https://www.instagram.com/p/C7example2/" },
  { month: 7, day: 15, date: "2025-07-15", title: "Heat Styling Protection", description: "Share essential heat styling tips for summer. Cover protecting extensions from damage.", category: "Educational", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C7example3/" },
  { month: 7, day: 20, date: "2025-07-20", title: "Mid-Summer Transformation", description: "Feature a stunning mid-summer transformation with bright, sun-kissed extensions.", category: "Before & After", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C7example4/" },
  { month: 7, day: 31, date: "2025-07-31", title: "July Recap", description: "Compile the best summer content from July into a highlights reel.", category: "Before & After", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C7example5/" },
  
  { month: 8, day: 1, date: "2025-08-01", title: "August Fresh Starts", description: "Welcome August with back-to-school and fresh start energy. Inspire clients to refresh their look.", category: "Inspiration", contentType: "Photo", instagramExampleUrl: "https://www.instagram.com/p/C8example1/" },
  { month: 8, day: 10, date: "2025-08-10", title: "Back to School Hair Guide", description: "Create a guide for students and teachers refreshing their hair for the new school year.", category: "Educational", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C8example2/" },
  { month: 8, day: 15, date: "2025-08-15", title: "End of Summer Sale", description: "Announce an end-of-summer promotion for clients wanting to refresh their look before fall.", category: "Promotional", contentType: "Photo", instagramExampleUrl: null },
  { month: 8, day: 20, date: "2025-08-20", title: "Transitioning Summer to Fall", description: "Guide clients on transitioning their hair color and style from summer brightness to fall warmth.", category: "Educational", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C8example3/" },
  { month: 8, day: 31, date: "2025-08-31", title: "August Highlights", description: "Bid farewell to summer with a compilation of August's best transformations.", category: "Before & After", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C8example4/" },
  
  { month: 9, day: 1, date: "2025-09-01", title: "Hello Fall Hair Season", description: "Welcome the fall season with warm, cozy hair inspiration. Feature autumnal colors and rich tones.", category: "Inspiration", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C9example1/" },
  { month: 9, day: 10, date: "2025-09-10", title: "Fall Color Trends Guide", description: "Comprehensive guide to fall hair color trends - copper, auburn, chocolate, and caramel tones.", category: "Trending", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C9example2/" },
  { month: 9, day: 15, date: "2025-09-15", title: "Cozy Fall Transformation", description: "Feature a stunning fall transformation with warm, rich colors perfect for the season.", category: "Before & After", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C9example3/" },
  { month: 9, day: 21, date: "2025-09-21", title: "Fall Equinox Celebration", description: "Celebrate the first official day of fall with seasonal inspiration and gratitude.", category: "Inspiration", contentType: "Photo", instagramExampleUrl: null },
  { month: 9, day: 30, date: "2025-09-30", title: "September Gallery", description: "Compile the month's best fall transformations into a beautiful gallery.", category: "Before & After", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C9example4/" },
  
  { month: 10, day: 1, date: "2025-10-01", title: "October Hair Magic", description: "Welcome October with enchanting fall hair inspiration. Embrace the magical, cozy vibes.", category: "Inspiration", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C10example1/" },
  { month: 10, day: 10, date: "2025-10-10", title: "Pumpkin Spice Hair Trend", description: "Feature the trending pumpkin spice hair color - warm oranges, coppers, and golden tones.", category: "Trending", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C10example2/" },
  { month: 10, day: 15, date: "2025-10-15", title: "Halloween Hair Ideas", description: "Share hair extension ideas for popular Halloween costumes. Show versatility and creative styling.", category: "Tips & Tricks", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C10example3/" },
  { month: 10, day: 25, date: "2025-10-25", title: "Dark & Dramatic Fall Looks", description: "Feature dark, dramatic hair transformations perfect for the moody fall aesthetic.", category: "Before & After", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C10example4/" },
  { month: 10, day: 31, date: "2025-10-31", title: "Happy Halloween", description: "Celebrate Halloween with festive wishes and showcase of the day's amazing looks.", category: "Engagement", contentType: "Carousel", instagramExampleUrl: null },
  
  { month: 11, day: 1, date: "2025-11-01", title: "November Gratitude Month", description: "Welcome November with gratitude themes. Begin sharing what you're thankful for.", category: "Inspiration", contentType: "Photo", instagramExampleUrl: "https://www.instagram.com/p/C11example1/" },
  { month: 11, day: 10, date: "2025-11-10", title: "Holiday Hair Prep Guide", description: "Create a comprehensive guide for preparing hair and extensions for the holiday season.", category: "Educational", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C11example2/" },
  { month: 11, day: 15, date: "2025-11-15", title: "Thanksgiving Hair Inspiration", description: "Share Thanksgiving-ready hairstyles - elegant yet practical for cooking and celebrating.", category: "Inspiration", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C11example3/" },
  { month: 11, day: 27, date: "2025-11-27", title: "Happy Thanksgiving", description: "Share heartfelt Thanksgiving wishes with your community. Express gratitude for clients.", category: "Engagement", contentType: "Photo", instagramExampleUrl: null },
  { month: 11, day: 29, date: "2025-11-29", title: "Black Friday Sale", description: "Announce Black Friday deals on extension services, products, and gift cards.", category: "Promotional", contentType: "Carousel", instagramExampleUrl: null },
  { month: 11, day: 30, date: "2025-11-30", title: "November Gratitude Recap", description: "Conclude November with a gratitude recap - favorite moments and client wins.", category: "Before & After", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C11example4/" },
  
  { month: 12, day: 1, date: "2025-12-01", title: "December Magic Begins", description: "Welcome December with holiday magic and festive hair inspiration.", category: "Inspiration", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C12example1/" },
  { month: 12, day: 10, date: "2025-12-10", title: "Holiday Party Hair Guide", description: "Comprehensive guide to holiday party hairstyles - from office parties to black-tie events.", category: "Tips & Tricks", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C12example2/" },
  { month: 12, day: 15, date: "2025-12-15", title: "Glamorous Holiday Transformation", description: "Feature a stunning holiday transformation - sparkle, glamour, and festive elegance.", category: "Before & After", contentType: "Reel", instagramExampleUrl: "https://www.instagram.com/p/C12example3/" },
  { month: 12, day: 20, date: "2025-12-20", title: "Year in Review: Best Transformations", description: "Begin the year-end review with the year's most stunning transformations.", category: "Before & After", contentType: "Carousel", instagramExampleUrl: "https://www.instagram.com/p/C12example4/" },
  { month: 12, day: 25, date: "2025-12-25", title: "Merry Christmas", description: "Share warm Christmas wishes with your community. Celebrate the joy of the holiday.", category: "Engagement", contentType: "Photo", instagramExampleUrl: null },
  { month: 12, day: 31, date: "2025-12-31", title: "Happy New Year", description: "Celebrate New Year's Eve with festive wishes and excitement for the year ahead.", category: "Engagement", contentType: "Photo", instagramExampleUrl: null },
];

function generateHashtags(category: string, contentType: string): string[] {
  const baseHashtags = ["#HairExtensions", "#ExtensionSpecialist", "#HairTransformation"];
  
  const categoryHashtags: Record<string, string[]> = {
    "Educational": ["#HairEducation", "#HairTips", "#LearnWithMe"],
    "Before & After": ["#BeforeAndAfter", "#HairMagic", "#TransformationTuesday"],
    "Behind the Scenes": ["#BehindTheScenes", "#SalonLife", "#DayInTheLife"],
    "Client Spotlight": ["#ClientLove", "#HappyClient", "#ClientSpotlight"],
    "Product Showcase": ["#HairProducts", "#PremiumHair", "#QualityExtensions"],
    "Promotional": ["#SpecialOffer", "#BookNow", "#SalonPromo"],
    "Engagement": ["#HairCommunity", "#HairLove", "#HairFam"],
    "Inspiration": ["#HairInspo", "#HairGoals", "#DreamHair"],
    "Tips & Tricks": ["#HairHacks", "#StylingTips", "#ProTips"],
    "Trending": ["#HairTrends", "#TrendingNow", "#HairTrend"],
  };
  
  const contentTypeHashtags: Record<string, string[]> = {
    "Photo": ["#HairPhoto", "#HairOfTheDay"],
    "Video": ["#HairVideo", "#HairTutorial"],
    "Reel": ["#HairReels", "#ReelsTrending"],
    "Carousel": ["#HairCarousel", "#SwipeRight"],
    "Story": ["#HairStory", "#DailyContent"],
    "Live": ["#HairLive", "#LiveSession"],
  };
  
  return [
    ...baseHashtags,
    ...(categoryHashtags[category] || []),
    ...(contentTypeHashtags[contentType] || []),
  ];
}

export async function seedPosts() {
  const existingPosts = await db.select().from(posts).limit(1);
  if (existingPosts.length > 0) {
    console.log("Posts already seeded, skipping...");
    return;
  }
  
  console.log("Seeding posts...");
  
  const postsToInsert = contentData.map((post) => ({
    ...post,
    hashtags: generateHashtags(post.category, post.contentType),
    isAiGenerated: false,
  }));
  
  await db.insert(posts).values(postsToInsert);
  console.log(`Seeded ${postsToInsert.length} posts`);
}
