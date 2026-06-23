# Spotify UI/UX Style Guide

## Core Design Philosophy
Spotify's interface is built around **music-first minimalism** with bold visual hierarchy and seamless, intuitive navigation. The design prioritizes content discovery and playback control while maintaining a sophisticated, modern aesthetic.

---

## Color System

### Primary Palette
- **Spotify Green**: `#1DB954` - Primary brand color, used for CTAs, active states, and key interactions
- **Background Black**: `#121212` - Main background
- **Surface Black**: `#181818` - Card/container backgrounds
- **Elevated Surface**: `#282828` - Hover states, elevated components
- **Base White**: `#FFFFFF` - Primary text
- **Subdued White**: `#B3B3B3` - Secondary text, metadata

### Semantic Colors
- **Error Red**: `#E22134`
- **Success Green**: `#1DB954`
- **Warning Yellow**: `#FFA42B`
- **Link Blue**: `#4D92FF`

### Gradient Overlays
- Dynamic header gradients that blend from vibrant colors (extracted from album art) into `#121212`
- Typical gradient: `linear-gradient(180deg, [extracted-color] 0%, #121212 100%)`
- Gradient height: 232-340px depending on context

---

## Typography

### Font Family
- **Primary**: Circular (Spotify's proprietary font)
- **Fallback**: `'Helvetica Neue', Helvetica, Arial, sans-serif`
- **Monospace** (for timestamps): `'Courier New', monospace`

### Type Scale
```
Display Large: 96px / 700 weight / -1.5px letter-spacing
Display: 72px / 700 weight / -0.5px letter-spacing
H1: 48px / 700 weight / -0.5px letter-spacing
H2: 32px / 700 weight / 0px letter-spacing
H3: 24px / 700 weight / 0px letter-spacing
H4: 20px / 700 weight / 0.25px letter-spacing
Body Large: 16px / 400 weight / 0.5px letter-spacing
Body: 14px / 400 weight / 0.25px letter-spacing
Body Small: 12px / 400 weight / 0.4px letter-spacing
Caption: 11px / 400 weight / 0.4px letter-spacing
```

### Text Styling Rules
- **Truncation**: Single-line text uses ellipsis overflow
- **Line Height**: 1.6 for body text, 1.2-1.3 for headings
- **Link States**: Underline on hover only
- **Emphasis**: Use 700 weight, never italics for UI elements

---

## Spacing System

### Base Unit: 8px
```
4px   (0.5x)  - Micro spacing
8px   (1x)    - Tight spacing
12px  (1.5x)  - Compact spacing
16px  (2x)    - Standard spacing
24px  (3x)    - Medium spacing
32px  (4x)    - Large spacing
48px  (6x)    - XL spacing
64px  (8x)    - Section spacing
```

### Grid Layout
- **Container Max Width**: 1955px
- **Sidebar Width**: 280px (collapsible to 72px icon-only mode)
- **Content Padding**: 16px mobile, 24px tablet, 32px desktop
- **Card Gaps**: 16px between items in grids

---

## Border Radius System

```
Small: 4px    - Buttons, tags, small chips
Medium: 6px   - Input fields, small cards
Large: 8px    - Standard cards, containers
XL: 12px      - Large cards, modal corners
Round: 50%    - Avatar images, icon buttons
Pill: 500px   - Pill buttons, badges
```

---

## Elevation & Shadows

### Shadow Layers
```
Low: 0 2px 4px rgba(0,0,0,0.3)
Medium: 0 4px 12px rgba(0,0,0,0.4)
High: 0 8px 24px rgba(0,0,0,0.5)
Modal: 0 16px 64px rgba(0,0,0,0.7)
```

### Context Menu: 
`0 16px 24px rgba(0,0,0,0.3), 0 6px 8px rgba(0,0,0,0.2)`

---

## Component Specifications

### Buttons

**Primary Button**
- Background: `#1DB954`
- Color: `#000000`
- Padding: `12px 32px`
- Border-radius: `500px`
- Font: 14px / 700 weight
- Hover: Scale `1.04`, brightness increase
- Active: Scale `0.96`
- Disabled: Opacity `0.3`

**Secondary Button**
- Background: `transparent`
- Border: `1px solid #727272`
- Color: `#FFFFFF`
- Hover: Border `#FFFFFF`, scale `1.04`

**Icon Button**
- Size: `32px × 32px`
- Background: `transparent`
- Hover: Background `rgba(255,255,255,0.1)`
- Active: Background `rgba(255,255,255,0.2)`

### Cards

**Standard Card**
- Background: `#181818`
- Border-radius: `8px`
- Padding: `16px`
- Hover: Background `#282828`, lift with `translateY(-4px)`, shadow increase
- Transition: `all 0.3s ease`

**Album/Playlist Card**
- Image aspect: `1:1` (square)
- Image border-radius: `8px` (albums), `50%` (artists)
- Title: 14px / 700 weight, 1-2 line clamp
- Subtitle: 12px / 400 weight, `#B3B3B3`, 1 line clamp
- Play button: Appears on hover, bottom-right offset, 48px size, green background with play icon

### Navigation

**Sidebar**
- Background: `#000000`
- Width: `280px` (expanded), `72px` (collapsed)
- Item height: `40px`
- Active state: White text, left border `3px solid #1DB954`
- Hover: White text, background `#1A1A1A`
- Icon size: `24px`
- Icon + text gap: `16px`

**Top Bar**
- Height: `64px`
- Background: Dynamic gradient or `rgba(18,18,18,0.9)`
- Backdrop blur: `10px`
- Sticky positioned
- Back/forward buttons: 32px circles, black background

### Input Fields

**Search Bar**
- Height: `40px`
- Background: `#242424`
- Border-radius: `500px`
- Padding: `6px 12px 6px 48px` (icon space)
- Placeholder: `#A7A7A7`
- Focus: Border `2px solid #FFFFFF`
- Icon: Magnifying glass, `#FFFFFF`, 24px

### Player Controls

**Bottom Player Bar**
- Height: `90px`
- Background: `#181818`
- Border-top: `1px solid #282828`
- Layout: 3 columns (track info 30% | controls 40% | volume/device 30%)

**Play Button (Main)**
- Size: `32px`
- Background: `#FFFFFF`
- Icon: `#000000`
- Border-radius: `50%`
- Hover: Scale `1.06`

**Progress Bar**
- Height: `4px`
- Background: `#4D4D4D`
- Filled: `#1DB954`
- Hover: Height `8px`, thumb appears (12px circle)

### Modals & Overlays

**Modal Container**
- Background: `#282828`
- Border-radius: `12px`
- Max-width: `524px`
- Padding: `32px`
- Shadow: High elevation
- Backdrop: `rgba(0,0,0,0.75)` with blur

**Context Menu**
- Background: `#282828`
- Border-radius: `4px`
- Padding: `4px`
- Min-width: `196px`
- Item height: `40px`
- Item hover: `#3E3E3E`

---

## Interaction Patterns

### Hover States
- **Cards**: Lift 4px, background lightens, play button fades in
- **Buttons**: Scale 1.04, brightness increase
- **Text Links**: Underline appears
- **List Items**: Background `#1A1A1A`

### Active/Playing States
- **Track**: Green text color or green animated equalizer icon
- **Tab**: White text with green underline (3px)
- **Sidebar Item**: White text, green left border

### Loading States
- **Skeleton Screens**: Gray animated pulse, maintain layout
- **Spinner**: Green circular spinner (36px) or green pulsing dot
- **Progress**: Indeterminate green progress bar

### Transitions
```
Standard: 0.3s ease
Quick: 0.15s ease
Smooth: 0.4s cubic-bezier(0.3, 0, 0.4, 1)
Bounce: 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

---

## Scrolling Behavior

- **Smooth Scrolling**: Enabled for all containers
- **Scroll Snap**: On horizontal carousels
- **Sticky Headers**: Context-aware with blur backdrop
- **Infinite Scroll**: For playlists, search results
- **Custom Scrollbars**: 
  - Width: `12px`
  - Thumb: `#3E3E3E`
  - Track: `transparent`
  - Thumb hover: `#555555`

---

## Responsive Breakpoints

```
Mobile: 0-767px
Tablet: 768-1023px
Desktop: 1024-1439px
Large Desktop: 1440px+
```

### Responsive Adjustments
- **Mobile**: Single column, bottom navigation, collapsed player
- **Tablet**: 2-3 column grids, sidebar collapsible
- **Desktop**: Full sidebar, multi-column layouts, hover states active

---

## Animation Guidelines

### Micro-interactions
- **Play/Pause**: Icon morph transition (200ms)
- **Like Heart**: Pop + color fill (300ms with bounce)
- **Add to Playlist**: Checkmark slide-in (250ms)
- **Volume**: Smooth slider with immediate visual feedback

### Page Transitions
- **Fade**: 200ms fade between route changes
- **Slide**: New content slides up slightly (20px) while fading in

### Gesture Feedback
- **Ripple**: Material-style ripple on touch (mobile)
- **Press**: Scale down 0.96 on press, spring back on release

---

## Accessibility Requirements

- **Contrast Ratios**: Minimum 4.5:1 for text, 3:1 for UI components
- **Focus Indicators**: 2px white outline with 2px offset
- **Keyboard Navigation**: Tab order follows visual hierarchy
- **ARIA Labels**: Required for icon buttons and complex interactions
- **Screen Reader**: Announce state changes (playing, added, etc.)
- **Reduced Motion**: Respect `prefers-reduced-motion` query

---

## Content Layout Patterns

### Grid Systems
- **Playlists/Albums**: 5-8 columns (responsive)
- **Gap**: 16px between items
- **Min Card Width**: 164px

### List Views
- **Row Height**: 56px for track lists
- **Striped**: Subtle hover reveals `#1A1A1A` background
- **Dividers**: `1px solid rgba(255,255,255,0.1)` between sections

### Hero Sections
- **Height**: 340px (desktop), 230px (mobile)
- **Content Alignment**: Bottom-left
- **Gradient Overlay**: From transparent to `rgba(0,0,0,0.6)`
- **Play Button**: 56px, green, shadow on hover

---

This style guide provides the foundation for building an interface that matches Spotify's polished, music-first experience with smooth interactions and intuitive navigation.

Build the following application:

The user wants a workout builder integrated with music playlists where: 1. Each exercise is synced to tempo/length/emotional intensity of music 2. Slower movements = less intense music 3. High energy workouts = intense, fast music 4. Voice instructions during exercise ("10 reps left, keep it up!") 5. Gamified elements This is a complex app that combines: - Workout planning/building - Music playlist integration - Text-to-speech for voice coaching - Timer/counting functionality - Spotify-style UI I should: 1. Create a new window with Spotify design aesthetic 2. Build an interface for creating/viewing workouts 3. Show exercises with music pairing 4. Include play/control features 5. Initialize speech synthesis for voice coaching Let me start by creating a window and building the workout builder interface. I'll need to init speech synthesis for the voice coaching feature. The UI should follow Spotify's design: - Dark backgrounds (#121212, #181818, #282828) - Green accent (#1DB954) - Bold typography - Card-based layouts - Smooth interactions I'll create a workout builder view that shows: 1. Current workout overview 2. Exercise list with music tempo matching 3. Play controls 4. Voice coaching toggle Let me start with a medium-large window and build the interface step by step. 🔧 window_new 🔧 init_speech_synthesis
