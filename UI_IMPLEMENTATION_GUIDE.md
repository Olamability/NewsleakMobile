# UI Implementation Guide

This document describes the UI patterns implemented based on the reference designs in the `/UI` folder.

## Reference Designs Analyzed

1. **Sign-In.jpg** - Clean authentication screen
2. **Sign-In [ Loading ].jpg** - Loading state during authentication
3. **Home.jpg** - Home screen with personalized greeting and news feed
4. **Search [ No Filters ].jpg** - Search screen empty state
5. **Search [ Search Results, News ].jpg** - Search results with filters

## Design System

### Color Palette

Based on the reference designs, the following color system was implemented:

```typescript
// Primary Colors
primary: '#E81E24' // Opera News Red (kept for branding)
buttonGray: '#7A8A99' // Gray for auth buttons (from Sign-In screen)
buttonGrayDark: '#5F6F7D' // Darker gray for pressed state

// Background Colors
background: '#FFFFFF' // White
searchBackground: '#F0F4F8' // Light blue-gray for search inputs
filterActive: '#D4E9FC' // Light blue for active filter chips

// Text Colors
text: '#1A1A1A' // Dark gray for primary text
textSecondary: '#666666' // Medium gray for secondary text
textPlaceholder: '#B0B0B0' // Light gray for placeholders

// Icon Colors
iconGray: '#8F9BB3' // Gray for inactive icons
iconActive: '#222B45' // Dark for active icons
```

### Typography

- **Titles**: Font size 28px (xxxl), bold (700)
- **Subtitles**: Font size 15px (md), regular, color textSecondary
- **Body**: Font size 15px (md), regular
- **Labels**: Font size 13px (sm), semi-bold (600)

### Spacing

Following the reference designs:
- Screen padding: 24px (xl)
- Section spacing: 32px (xxl)
- Element spacing: 12-16px (md-lg)
- Tight spacing: 4-8px (xs-sm)

## Component Updates

### Input Component

**New Features:**
- Left icon support (email ✉️, lock 🔒, user 👤)
- Password visibility toggle with eye icon
- Search variant with light blue background
- Improved accessibility labels

**Usage Examples:**
```tsx
// Email input with icon
<Input
  placeholder="Email"
  leftIcon={<Text style={styles.inputIcon}>✉️</Text>}
  keyboardType="email-address"
/>

// Password input with toggle
<Input
  placeholder="Password"
  leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
  showPasswordToggle
/>

// Search input
<Input
  placeholder='Search "News"'
  variant="search"
/>
```

### Button Component

**New Variants:**
- `gray` - Muted gray button for auth screens (#7A8A99)
- `social` - White button with border for social auth

**Usage Examples:**
```tsx
// Gray auth button
<Button
  title="Sign in"
  variant="gray"
  fullWidth
  size="large"
/>

// Social auth button
<Button
  title="Sign in with Google"
  variant="social"
  icon={<Text>🔍</Text>}
  fullWidth
/>
```

## Screen Implementations

### Sign-In Screen

**Key Features:**
- Clean title: "Sign In"
- Descriptive subtitle about staying informed
- Icons in email and password inputs
- Password visibility toggle
- "Forgot password?" link
- Gray sign-in button
- Social auth options (Google, Facebook)
- "or" divider between auth methods
- Footer with sign-up link

**Layout:**
```
┌─────────────────────┐
│  Sign In            │
│  Stay informed...   │
│                     │
│  ✉️ [Email Input]   │
│  🔒 [Password] 👁   │
│      Forgot password│
│                     │
│  [Gray Sign In Btn] │
│                     │
│  ─── or ───         │
│                     │
│  🔍 [Google Button] │
│  📘 [FB Button]     │
│                     │
│  Don't have acc?    │
│  Sign up            │
└─────────────────────┘
```

### Home Screen

**Key Features:**
- White header (not red)
- Menu icon (☰) on left
- Notification icon (🔔) on right
- Personalized greeting: "Welcome back, [Name]!"
- Subtitle: "Discover a world of news that matters to you"
- "Trending news" section with "See all" link
- News cards with images on left
- Bottom tab navigation (Home, Categories, Search, Saved, Profile)

**Layout:**
```
┌─────────────────────┐
│ ☰          🔔      │
│                     │
│ Welcome back, Name! │
│ Discover a world... │
│                     │
│ Trending news  See ›│
│                     │
│ ┌─────────────────┐ │
│ │ [News Card]     │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ [News Card]     │ │
│ └─────────────────┘ │
│                     │
│ 🏠 📂 🔍 🔖 👤    │
└─────────────────────┘
```

### Search Screen

**Key Features:**
- Back button (←) for navigation
- Search input with integrated icon (🔍)
- Light blue search background
- "Add Filter" button in light blue
- News/Publishers tabs
- Result count display
- Sort dropdown
- Empty state with "Recents" message

**Layout (No Results):**
```
┌─────────────────────┐
│ ← 🔍 Search "News"  │
│                     │
│ [Add Filter]        │
│                     │
│ News | Publishers   │
│ ─────              │
│                     │
│     Recents         │
│  Your recent searches│
│  will appear here... │
│                     │
│ 🏠 📂 🔍 🔖 👤    │
└─────────────────────┘
```

**Layout (With Results):**
```
┌─────────────────────┐
│ ← 🔍 Climate change │
│                     │
│ [Add Filter]        │
│                     │
│ News | Publishers   │
│ ─────              │
│                     │
│ 600 Results found:  │
│           Sort by: ▼│
│                     │
│ ┌─────────────────┐ │
│ │ [News Card]     │ │
│ └─────────────────┘ │
│                     │
│ 🏠 📂 🔍 🔖 👤    │
└─────────────────────┘
```

### Sign-Up Screen

**Key Features:**
- Same design pattern as Sign-In
- Four input fields with icons:
  - 👤 Full Name
  - ✉️ Email
  - 🔒 Password (with toggle)
  - 🔒 Confirm Password (with toggle)
- Gray sign-up button
- Social auth options
- Footer with sign-in link

## Design Principles Applied

1. **Consistency** - Same patterns across auth screens
2. **Clarity** - Clear titles and descriptive subtitles
3. **Visual Hierarchy** - Proper spacing and typography scale
4. **Accessibility** - Labels for screen readers, adequate touch targets
5. **Color Psychology** - Muted colors for less aggressive CTA
6. **Icon Usage** - Consistent emoji icons for visual interest
7. **White Space** - Generous padding for breathing room
8. **Progressive Disclosure** - Showing/hiding passwords, filters

## Icon Library

The following emoji icons are used consistently:

- ✉️ Email
- 🔒 Lock/Password
- 👤 User/Person
- 👁️ Show password
- 👁️‍🗨️ Hide password
- 🔍 Search
- ☰ Menu
- 🔔 Notification
- 📘 Facebook
- 🏠 Home
- 📂 Categories
- 🔖 Saved/Bookmarks
- ← Back

## Responsive Considerations

All layouts adapt to different screen sizes:
- Card widths calculated based on window width
- Images scale proportionally
- Text wraps appropriately
- Touch targets remain at least 44x44 points

## Implementation Status

✅ **Completed:**
- Theme colors and constants
- Input component enhancements
- Button component variants
- Sign-In screen redesign
- Sign-Up screen redesign
- Home screen header updates
- Search screen redesign

📋 **Future Enhancements:**
- Animated transitions between screens
- Skeleton loading states
- Pull-to-refresh animations
- Filter sheet implementation
- Sort menu implementation
- Empty state illustrations

## Testing Checklist

- [ ] All screens render correctly on iOS
- [ ] All screens render correctly on Android
- [ ] Screen readers can navigate all interactive elements
- [ ] Touch targets are appropriate size
- [ ] Text is legible at all sizes
- [ ] Colors meet contrast requirements
- [ ] Keyboard navigation works properly
- [ ] Form validation displays correctly
- [ ] Loading states show appropriate feedback
- [ ] Error states are user-friendly

## References

- UI Reference Images: `/UI` folder
- Figma Design System: [Link if available]
- React Native Paper: For future icon library consideration
- Accessibility Guidelines: WCAG 2.1 AA
