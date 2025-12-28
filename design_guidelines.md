# Design Guidelines: Content Calendar for Hair Extension Professionals

## Design Approach
**Reference-Based Approach**: Drawing inspiration from Notion's calendar views and Planoly's content planning interface, focusing on clean, intuitive navigation and organized content display.

## Color System
- **Primary**: #C89F7E (warm rose gold) - Main accent, CTAs, highlights
- **Secondary**: #2D2424 (deep brown) - Headers, important text
- **Accent**: #E8D5C4 (soft cream) - Hover states, backgrounds
- **Background**: #FAFAFA (off-white) - Main canvas
- **Text**: #333333 (charcoal) - Body text
- **Success**: #A0846F (muted taupe) - Indicators, badges

## Typography
- **Headings**: Montserrat (600-700 weight)
  - H1: 32px (mobile: 24px)
  - H2: 24px (mobile: 20px)
  - H3: 20px (mobile: 18px)
- **Body**: Lato (regular 400, medium 500)
  - Base: 16px
  - Small: 14px

## Layout System
**Tailwind Spacing**: Use units of 2, 4, 6, and 8 (p-4, m-6, gap-8)
- Mobile-first responsive approach
- Container max-width: max-w-7xl
- Section padding: py-8 (mobile), py-12 (desktop)

## Component Library

### Navigation
- Fixed top navigation bar with month selector dropdown
- Category filter chips (pill-shaped buttons)
- Content type toggle buttons

### Calendar Display
- **Monthly Grid View**: 7-column calendar grid showing dates with post cards
- **Post Cards**: Compact cards showing date, category badge, post title, content type icon
- Card hover: subtle lift effect with accent background
- Selected state: primary color border

### Detail View
- Modal/sidebar showing full post details
- Post title, date, category badge
- Full description with formatting
- Content type recommendations
- Suggested hashtags section

### Filters & Controls
- Month navigation: Previous/Next buttons + dropdown selector
- Category filters: Multi-select chip system
- Content type filters: Icon-based toggle grid
- Clear all filters button

### Mobile Optimization
- Collapsible navigation drawer
- Swipeable month navigation
- Single-column list view option
- Bottom sheet for post details

## Interaction Patterns
- Smooth transitions (200-300ms)
- Card tap/click to expand details
- Swipe gestures for month navigation (mobile)
- Persistent filter state during navigation

## Images
No hero image required. Focus on icon-based visual hierarchy with category badges and content type indicators using icon libraries (Heroicons recommended for consistency with clean design aesthetic).

## iOS 26 Liquid Glass Design System

This app implements the iOS 26 Liquid Glass design aesthetic with the following principles:

### Glass Effects
- **glass**: Standard glass effect with 70% opacity, 20px blur, and 180% saturation
- **glass-light**: Lighter glass with 50% opacity and 12px blur
- **glass-ultra**: Premium glass with 85% opacity, 30px blur, and subtle shadow
- **glass-nav**: Navigation-specific glass for bottom floating nav
- **glass-header**: Header glass with bottom border highlight
- **glass-card**: Card-specific glass with subtle elevation
- **glass-pill**: Floating pill-shaped containers

### Visual Characteristics
- Translucent surfaces that hint at content beneath
- Floating controls with rounded corners (rounded-2xl, rounded-3xl)
- Depth-aware layering with subtle shadows
- Clean borders using rgba white values

### Animation Principles
- **fluid-transition**: Smooth 300ms ease-out transitions
- **fluid-spring**: Bouncy 400ms spring animations for interactive elements
- Active states use subtle scale transforms (0.95)

### Component Patterns
- Bottom navigation: Floating glass pill with 3 items, positioned above bottom edge
- Headers: Sticky glass-header with backdrop blur
- Cards: Glass-card with rounded-2xl corners, no hard borders
- Icons: Rounded-xl containers with backdrop blur
- Badges: Colored but translucent backgrounds

### Dark Mode Adaptations
- Glass backgrounds shift to dark grays (20-40% opacity)
- Borders use rgba white at lower opacity (0.08-0.15)
- Shadows become more pronounced for depth perception

## Key Design Principles
1. **Scanability**: Clear visual hierarchy allows quick browsing of 365 posts
2. **Accessibility**: Sufficient color contrast, touch-friendly targets (min 44px)
3. **Performance**: Lazy load post cards, virtualize long lists
4. **Consistency**: Unified card design across all views, predictable navigation patterns
5. **Translucency**: Use glass effects to create depth without heavy borders
6. **Fluidity**: Smooth animations and spring transitions for natural feel