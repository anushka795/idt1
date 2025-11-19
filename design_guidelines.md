# QuizConnect Design Guidelines

## Design Approach

**Selected System**: Modern Educational Platform Design inspired by Notion's clarity, Linear's typography, and Canvas LMS's educational interface patterns.

**Justification**: QuizConnect is a utility-focused educational platform requiring clear information hierarchy, efficient workflows, and consistent patterns across student and teacher experiences.

## Core Design Elements

### A. Typography

**Font Families** (via Google Fonts CDN):
- Primary: Inter (400, 500, 600, 700) - UI, body text, forms
- Accent: Outfit (600, 700) - Headlines, hero sections, large numbers

**Hierarchy**:
- Hero Headlines: text-5xl/text-6xl, font-bold (Outfit)
- Section Titles: text-3xl/text-4xl, font-bold (Outfit)
- Card Titles: text-xl, font-semibold (Inter)
- Body Text: text-base, font-normal (Inter)
- Captions/Labels: text-sm, font-medium (Inter)
- Stats/Numbers: text-4xl/text-5xl, font-bold (Outfit)

### B. Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Micro spacing: gap-2, p-2
- Component spacing: p-4, gap-4, m-6
- Section spacing: py-12, py-16, py-20
- Container spacing: px-4, px-6, px-8

**Grid System**:
- Desktop: max-w-7xl for main content
- Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Dashboards: Two-column layouts (sidebar + main)
- Forms: Single column, max-w-md centered

### C. Component Library

**Navigation**:
- Top navbar: Fixed, backdrop-blur, border-b
- Role indicator badge in top-right
- Logout button always visible
- Mobile: Hamburger menu with slide-out drawer

**Landing Page** (Multi-section, comprehensive):
1. **Hero Section** (h-screen): Large hero image (students collaborating in modern campus), centered overlay with blurred background containing:
   - "QuizConnect" wordmark (text-6xl, Outfit font)
   - Tagline: "AI-Powered Learning, Real Results" (text-xl)
   - Two prominent CTAs side-by-side: "Student Portal" and "Teacher Portal" (large buttons with blur backdrop)

2. **Features Grid** (py-20): 3-column grid showcasing:
   - AI Quiz Generation (icon + title + description)
   - Live Leaderboards (icon + title + description)
   - Peer Collaboration (icon + title + description)

3. **How It Works** (py-20): 2-column layout with image on left:
   - For Teachers: Upload → AI Generates → Students Compete
   - For Students: Learn → Quiz → Earn XP & Badges

4. **Stats Section** (py-16): 4-column grid with large numbers:
   - "10,000+ Quizzes Generated"
   - "5,000+ Active Students"
   - "500+ Verified Teachers"
   - "95% Success Rate"

5. **Social Proof** (py-20): 3-column testimonial cards from students and teachers

6. **CTA Section** (py-20): Full-width with background treatment, centered CTA block

**Dashboards**:
- Sidebar navigation (w-64, fixed)
- Main content area with breadcrumbs
- Widget cards: rounded-xl, border, p-6
- Student Dashboard: XP progress bar (full-width), badges row, recommended quizzes grid (3-col), current rank card
- Teacher Dashboard: Verification status banner, course cards (2-col), quick stats (quiz count, student count)

**Quiz Interface**:
- Full-screen mode (fixed overlay)
- Timer in top-right corner (large, prominent)
- Progress indicator (question 1 of 10)
- Single question per view with 4 radio button options
- Large "Next" and "Submit" buttons
- Results screen: Score circle graph, accuracy percentage, time taken, XP earned badge

**Leaderboard**:
- Tabbed interface: Global / Course-wise
- Table layout with alternating row backgrounds
- Columns: Rank (#), Avatar, Name, Class, XP, Badges (icons), Accuracy %
- Highlight logged-in user's row with border accent
- Top 3 get medal icons

**Doubt Discussion**:
- Two-column: List view (left, w-1/3) + Detail view (right, w-2/3)
- Doubt cards with status badges (Open/Resolved)
- Threaded comments with indentation
- Reply form at bottom
- "Mark as Resolved" button for doubt author

**Forms** (Auth, Course Creation, Notes Upload):
- Centered cards (max-w-md)
- Generous spacing between fields (gap-6)
- Input fields: h-12, rounded-lg, border, px-4
- File upload: Drag-and-drop zone with dashed border
- Submit buttons: Full-width, h-12, text-lg

**Cards**:
- Course cards: Aspect ratio 16:9 thumbnail, p-6, hover lift effect
- Quiz cards: Icon, title, metadata row (questions count, time, difficulty badge)
- Badge cards: Icon, name, description

**Icons**: Font Awesome via CDN
- Consistent 20px/24px sizing
- Use in navigation, feature cards, badges, status indicators

### D. Animations

Use sparingly:
- Page transitions: Fade-in only
- Card hover: Subtle lift (translate-y-1)
- Button interactions: Native browser states
- Loading states: Spinner component

## Images

**Hero Section**: Large, high-quality image of diverse college students collaborating in a modern library or campus setting. Should convey energy, learning, and technology. Position: Background with dark overlay (opacity-60) for text readability.

**How It Works Section**: Illustration or photo showing teacher-student interaction with digital devices, positioned left side of 2-column layout.

**Feature Cards**: Icon-based (Font Awesome), no images needed.

**Testimonials**: Small circular avatars (48px) for each testimonial author.

## Viewport Strategy

- Landing page: Multi-section with natural scroll
- Hero: Full viewport height (h-screen)
- Content sections: Natural height based on content (py-16 to py-20)
- Dashboards: Full viewport height with scrollable content area
- Quiz interface: Fixed full-screen overlay