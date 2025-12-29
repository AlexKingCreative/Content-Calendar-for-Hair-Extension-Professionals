# Content Calendar for Hair Extension Professionals

## Overview

A comprehensive social media content calendar application designed specifically for hair extension professionals. Features include:
- 365 days of pre-generated social media post ideas with titles, descriptions, categories, content types, and hashtags
- Browse by month, filter by category and content type
- Posting challenges with progress tracking and streak/milestone rewards
- Native Instagram integration with OAuth, automatic post detection, and analytics dashboard
- Trend alerts with 7-day expiration
- Stripe subscriptions for premium features
- Email-only onboarding with automatic password generation

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for a warm, professional aesthetic (rose gold primary color, cream accents)
- **Typography**: Montserrat for headings, Lato for body text

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **Build Tool**: esbuild for server, Vite for client
- **Development**: Hot module replacement via Vite middleware

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod integration
- **Current Storage**: In-memory storage with programmatically generated content (365 days of hair extension social media posts)
- **Database Ready**: Drizzle configuration exists for PostgreSQL migration

### API Design
- RESTful endpoints under `/api/` prefix
- `GET /api/posts` - Fetch all posts
- `GET /api/posts/month/:month` - Fetch posts for a specific month (1-12)
- `GET /api/posts/:id` - Fetch single post by ID

### Instagram Integration
- **OAuth Flow**: Facebook/Instagram OAuth with CSRF protection via session-stored state tokens
- **Token Management**: Long-lived tokens (60-day expiry) with automatic refresh when within 7 days of expiration
- **Media Sync**: Fetches recent posts with engagement metrics (likes, comments, reach, impressions)
- **Auto-logging**: Instagram posts automatically logged for streak tracking when new posts detected during sync
- **Analytics Dashboard**: Dedicated page at `/instagram` showing engagement stats, post grid, and activity metrics
- **Service**: `InstagramService` class in `server/instagramService.ts` handles all Meta Graph API interactions

### Key Design Patterns
- **Monorepo Structure**: Client code in `/client`, server in `/server`, shared types in `/shared`
- **Path Aliases**: `@/` for client source, `@shared/` for shared modules
- **Component Organization**: UI primitives in `/components/ui`, feature components at `/components` root
- **Mobile-First**: Responsive design with `useIsMobile` hook for adaptive layouts

## External Dependencies

### UI Framework
- Radix UI primitives (dialog, select, popover, tooltip, etc.)
- Lucide React icons
- class-variance-authority for component variants
- embla-carousel for carousels

### Data & Forms
- TanStack React Query for data fetching and caching
- react-hook-form with zod resolver for form validation
- date-fns for date manipulation

### Database (Configured but not yet provisioned)
- PostgreSQL via Drizzle ORM
- connect-pg-simple for session storage (available)

### Build & Development
- Vite with React plugin
- Replit-specific plugins for dev banner and error overlay
- esbuild for production server bundling