# Design Guidelines: Hair Extension Social Media Content Calendar

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

## Key Design Principles
1. **Scanability**: Clear visual hierarchy allows quick browsing of 365 posts
2. **Accessibility**: Sufficient color contrast, touch-friendly targets (min 44px)
3. **Performance**: Lazy load post cards, virtualize long lists
4. **Consistency**: Unified card design across all views, predictable navigation patterns