import { z } from "zod";

export const contentTypes = ["Photo", "Video", "Reel", "Carousel", "Story", "Live"] as const;
export type ContentType = typeof contentTypes[number];

export const categories = [
  "Educational",
  "Before & After",
  "Behind the Scenes", 
  "Client Spotlight",
  "Product Showcase",
  "Promotional",
  "Engagement",
  "Inspiration",
  "Tips & Tricks",
  "Trending"
] as const;
export type Category = typeof categories[number];

export const postSchema = z.object({
  id: z.string(),
  date: z.string(),
  month: z.number().min(1).max(12),
  day: z.number().min(1).max(31),
  title: z.string(),
  description: z.string(),
  category: z.enum(categories),
  contentType: z.enum(contentTypes),
  hashtags: z.array(z.string()),
});

export type Post = z.infer<typeof postSchema>;

export const insertPostSchema = postSchema.omit({ id: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
