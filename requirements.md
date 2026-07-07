# Requirements Document

## Introduction

The Cinematic Portfolio Application is a film production-themed portfolio/resume website for Darsh Tank, built with Vite and React. The application presents professional information (projects, experience, education, skills, contact) through a vintage cinema aesthetic featuring countdown leaders, film grain effects, projector beams, and cinematic animations. The design transforms a traditional portfolio into an immersive theatrical experience while maintaining full responsiveness across all device sizes.

## Glossary

- **Application**: The complete Vite React application including configuration, components, and styling
- **Opening_Leader**: The countdown animation (3-2-1) displayed before the main content loads
- **Film_Grain**: Visual noise overlay simulating analog film texture
- **Projector_Beam**: Animated light effect simulating cinema projection
- **Slate**: Clapperboard-style UI component displaying act/scene information
- **Ticker**: Horizontal scrolling marquee displaying technologies and skills
- **Responsive_Layout**: Layout that adapts to mobile, tablet, and desktop screen sizes
- **Touch_Interface**: User interface elements optimized for touch interaction
- **Session_Runtime**: Elapsed time counter showing how long the user has been on the page
- **Vignette**: Darkened edges effect creating focus on central content
- **Commentary_Mode**: Optional director's commentary annotations for content sections
- **Film_Age_Control**: Slider control to increase grain intensity for vintage effect
- **Projector_Click**: Synthetic audio effect simulating film projector sound
- **Reveal_Animation**: Content animation triggered when elements enter viewport
- **Navigation_Bar**: Fixed header containing primary navigation and controls

## Requirements

### Requirement 1: Vite Project Setup

**User Story:** As a developer, I want a properly configured Vite React project, so that I can build and develop the application efficiently.

#### Acceptance Criteria

1. THE Application SHALL be initialized as a Vite project with React template
2. THE Application SHALL include TypeScript support with proper type definitions
3. THE Application SHALL use Tailwind CSS v4 for styling with inline theme configuration
4. THE Application SHALL include Lucide React for icon components
5. THE Application SHALL have a proper project structure with src/ directory containing components, assets, and entry files
6. THE Application SHALL include development scripts (dev, build, preview) in package.json
7. THE Application SHALL configure Vite to serve assets correctly and handle hot module replacement

---

### Requirement 2: Opening Countdown Leader

**User Story:** As a user, I want to see an academy-style countdown when the page loads, so that I experience an authentic cinema opening.

#### Acceptance Criteria

1. WHEN the Application loads, THE Opening_Leader SHALL display a countdown from 3 to 2 to 1
2. THE Opening_Leader SHALL display each number for 850 milliseconds
3. WHEN the countdown reaches zero, THE Opening_Leader SHALL display "presents" text with iris-in animation
4. THE Opening_Leader SHALL include film grain, scan lines, and vignette effects
5. THE Opening_Leader SHALL display "A Darsh Tank Picture" text above the countdown
6. THE Opening_Leader SHALL display reel metadata (REEL 01, 24 FPS, timecode) below the countdown
7. WHEN the countdown sequence completes, THE Opening_Leader SHALL fade out and reveal main content
8. THE Opening_Leader SHALL be responsive with appropriately scaled typography on mobile devices

---

### Requirement 3: Responsive Navigation Bar

**User Story:** As a user, I want a fixed navigation bar, so that I can easily navigate between sections on any device.

#### Acceptance Criteria

1. THE Navigation_Bar SHALL remain fixed at the top of the viewport during scrolling
2. THE Navigation_Bar SHALL include navigation links to Act I, Act II, Act III, and Credits sections
3. THE Navigation_Bar SHALL display "REC" indicator with animated red dot and user name
4. THE Navigation_Bar SHALL display current time in IST timezone with format HH:MM:SS
5. THE Navigation_Bar SHALL have semi-transparent backdrop blur effect
6. WHEN viewport width is below 768px, THE Navigation_Bar SHALL reduce padding and font sizes
7. WHEN viewport width is below 768px, THE Navigation_Bar SHALL hide the time display
8. THE Navigation_Bar SHALL support horizontal scrolling for navigation links on narrow screens
9. WHEN a navigation link is clicked, THE Application SHALL smoothly scroll to the target section

---

### Requirement 4: Film Age Control

**User Story:** As a user, I want to age the film appearance interactively, so that I can customize the vintage aesthetic.

#### Acceptance Criteria

1. WHEN the user clicks the REC indicator 5 or more times, THE Application SHALL reveal the Film_Age_Control
2. THE Film_Age_Control SHALL include a range slider from 0 to 100
3. WHEN the slider value changes, THE Application SHALL adjust Film_Grain opacity proportionally
4. THE Film_Age_Control SHALL display "Age the film" label
5. THE Film_Age_Control SHALL have ember-colored accent styling
6. THE Film_Age_Control SHALL maintain semi-transparent background with backdrop blur

---

### Requirement 5: Hero Section (Act I)

**User Story:** As a user, I want an impactful hero section, so that I immediately understand the portfolio's purpose and style.

#### Acceptance Criteria

1. THE Application SHALL display Act I section with Slate component showing "ACT I · THE OPENING SHOT · SC. 01"
2. THE Application SHALL display main headline "Coding with purpose, building with care" using display font
3. THE Application SHALL highlight "purpose" and "care" words with ember color
4. THE Application SHALL include projector beam and lens flare visual effects
5. THE Application SHALL display introductory paragraph about Darsh Tank with technology mentions
6. THE Application SHALL include "Roll Film" call-to-action button linking to Act II
7. THE Application SHALL include "On GitHub" link with arrow icon
8. THE Application SHALL display horizontal ticker at section bottom with technologies and titles
9. THE Application SHALL scale typography responsively using clamp() CSS function
10. WHEN viewport width is below 768px, THE Application SHALL stack content vertically in single column

---

### Requirement 6: Projects Showcase (Act II)

**User Story:** As a user, I want to see detailed project information, so that I can understand the developer's work and capabilities.

#### Acceptance Criteria

1. THE Application SHALL display Act II section with Slate component showing "ACT II · THE BODY OF WORK · SC. 02"
2. THE Application SHALL display section heading "Selected works" with link to full GitHub archive
3. THE Application SHALL render a list of 4 projects: AltiShift, WriteVerse, Draft AI, and Veil
4. FOR EACH project, THE Application SHALL display project number, name, year, role, runtime label, logline, technology stack, and scene breakdown bullets
5. FOR EACH project, THE Application SHALL include film perforation decorative strip on the left edge
6. FOR EACH project, THE Application SHALL include "Source" link to GitHub
7. FOR EACH project, THE Application SHALL apply hover effects changing text color to ember and lifting card
8. WHEN viewport width is below 768px, THE Application SHALL stack project information vertically
9. THE Application SHALL render project cards with custom cursor effect on hover
10. THE Application SHALL display technology stack as bordered tags with monospace font

---

### Requirement 7: Intermission Card

**User Story:** As a user, I want a visual break between major sections, so that I experience proper act pacing.

#### Acceptance Criteria

1. THE Application SHALL display an intermission section between Act II and Act III
2. THE Application SHALL display "— Intermission —" label in ember color with extended tracking
3. THE Application SHALL display "Reel change." heading in large display italic font with flicker animation
4. THE Application SHALL display "Please remain seated. Act III begins shortly." instruction
5. THE Application SHALL apply intense film grain and vignette effects to intermission section
6. THE Application SHALL use black background for intermission section

---

### Requirement 8: About, Experience, and Education (Act III)

**User Story:** As a user, I want to learn about the developer's background, so that I can evaluate their qualifications and experience.

#### Acceptance Criteria

1. THE Application SHALL display Act III section with Slate component showing "ACT III · THE BACKSTORY · SC. 03"
2. THE Application SHALL display "A note, from the desk" subsection with personal statement and current status
3. THE Application SHALL display "In the wild" subsection with 3 internship experiences: STP Web Hosting, InfiniteAI, and Technosoft
4. FOR EACH experience, THE Application SHALL display company name, role, technology stack, dates, location, and achievement bullets
5. THE Application SHALL display "The paper trail" subsection with 2 education entries: Nirma University and Atmiya University
6. FOR EACH education entry, THE Application SHALL display institution name, degree, dates, and location in a card layout
7. WHEN viewport width is below 768px, THE Application SHALL stack experience and education content vertically
8. THE Application SHALL apply hover effects to experience entries changing border color to ember
9. THE Application SHALL apply lift effect to education cards on hover

---

### Requirement 9: Skills Stack Section

**User Story:** As a user, I want to see the developer's technical skills, so that I can assess their technology expertise.

#### Acceptance Criteria

1. THE Application SHALL display a Stack section with inverted color scheme (foreground background, paper text)
2. THE Application SHALL display "Tools of the trade" heading
3. THE Application SHALL organize skills into 4 categories: Languages, Frameworks, Databases, and Tooling
4. FOR EACH category, THE Application SHALL display category label and list of skills
5. FOR EACH skill, THE Application SHALL apply hover effect translating 1px right and changing color to ember
6. THE Application SHALL render skills in display italic font
7. WHEN viewport width is below 640px, THE Application SHALL display skills in 1 column
8. WHEN viewport width is between 640px and 768px, THE Application SHALL display skills in 2 columns
9. WHEN viewport width is above 768px, THE Application SHALL display skills in 4 columns
10. THE Application SHALL apply film grain overlay with 40% opacity to Stack section

---

### Requirement 10: Contact Section

**User Story:** As a user, I want to contact the developer, so that I can reach out for opportunities or collaboration.

#### Acceptance Criteria

1. THE Application SHALL display Contact section with Slate component showing "EPILOGUE · THE FINAL SCENE · SC. FIN"
2. THE Application SHALL display "Let's build something." heading with "build" emphasized in ember italic
3. THE Application SHALL include introductory text about openness to opportunities
4. THE Application SHALL display email address as large clickable link with underline hover effect
5. THE Application SHALL include 4 contact links: Email (mailto:), Phone (tel:), GitHub, and LinkedIn
6. FOR EACH contact link, THE Application SHALL display icon, label, and arrow icon
7. FOR EACH contact link, THE Application SHALL apply hover effect changing text to ember color
8. THE Application SHALL include projector beam and lens flare visual effects
9. WHEN viewport width is below 768px, THE Application SHALL stack contact content vertically in single column
10. THE Application SHALL ensure email address breaks properly on narrow screens

---

### Requirement 11: Credits Section

**User Story:** As a user, I want to see attribution and project metadata, so that I understand the project's creation context.

#### Acceptance Criteria

1. THE Application SHALL display Credits section with "— End Credits —" label
2. THE Application SHALL display credits in staggered animation with categories: Directed & Written by, Starring, Cinematography, Original Score, Filmed on Location, Special Thanks
3. FOR EACH credit entry, THE Application SHALL display role label and credited names/technologies
4. THE Application SHALL display footer metadata including copyright year, font attribution, and current IST time
5. THE Application SHALL display "~ Darsh Tank" signature in large ember-colored italic font with flicker animation
6. THE Application SHALL include post-credits stinger text for users who scroll to the end
7. THE Application SHALL apply intense film grain overlay to Credits section
8. THE Application SHALL use centered text alignment for all credits content

---

### Requirement 12: Session Runtime Tracker

**User Story:** As a user, I want to see how long I've been viewing the site, so that I experience an authentic screening runtime.

#### Acceptance Criteria

1. WHEN the main content loads, THE Application SHALL start counting elapsed seconds
2. THE Application SHALL display Session_Runtime in MM:SS format in a ticket stub UI element
3. THE Application SHALL position the ticket stub at bottom-left of viewport with fixed positioning
4. THE Session_Runtime SHALL update every second
5. THE Application SHALL include Film icon and "Runtime" label in ticket stub
6. WHEN viewport width is below 640px, THE Application SHALL hide the Session_Runtime ticket stub
7. THE Application SHALL use monospace font with ember color for runtime value

---

### Requirement 13: Projector Sound Effect

**User Story:** As a user, I want optional sound effects when navigating, so that I have a more immersive cinema experience.

#### Acceptance Criteria

1. THE Application SHALL include a sound toggle button in the Navigation_Bar
2. WHEN the sound toggle is active, THE Application SHALL play synthetic click sound on navigation link clicks
3. THE Projector_Click SHALL use Web Audio API to generate square wave tone at 180Hz
4. THE Projector_Click SHALL last 80 milliseconds with exponential gain decay
5. THE Projector_Click SHALL have volume of 0.08 to avoid being disruptive
6. IF the browser does not support Web Audio API, THE Application SHALL fail silently without errors
7. THE Application SHALL display Volume2 icon when sound is enabled, VolumeX icon when disabled

---

### Requirement 14: Viewport-Based Reveal Animations

**User Story:** As a user, I want content to animate as I scroll, so that I experience dynamic, engaging reveals.

#### Acceptance Criteria

1. THE Application SHALL use IntersectionObserver to detect when elements enter viewport
2. WHEN an element with data-reveal attribute enters viewport, THE Application SHALL apply is-visible class
3. THE Application SHALL support data-reveal="blur" variant adding blur-to-clear transition
4. THE Application SHALL support data-stagger attribute for staggered child animations with 80ms delay increments
5. THE Application SHALL trigger reveal animations at 15% visibility threshold with -10% bottom margin
6. WHEN an element becomes visible, THE Application SHALL transition from opacity 0 to 1 and translateY(40px) to 0
7. IF IntersectionObserver is not supported, THE Application SHALL immediately add is-visible class to all elements
8. THE Application SHALL use cubic-bezier(0.2, 0.8, 0.2, 1) easing for reveal transitions

---

### Requirement 15: Persistent Visual Effects

**User Story:** As a user, I want consistent cinematic visual effects, so that I experience an authentic film aesthetic throughout.

#### Acceptance Criteria

1. THE Application SHALL apply Film_Grain overlay to entire viewport with fixed positioning at z-index 55
2. THE Film_Grain SHALL use SVG fractal noise pattern with 6-step animation loop
3. THE Film_Grain SHALL have base opacity of 0.4 plus additional opacity based on Film_Age_Control value
4. THE Application SHALL display letterbox bars at top and bottom of viewport with 52px height (36px on mobile)
5. THE Vignette SHALL use radial-gradient from transparent center to 65% black at edges
6. THE Projector_Beam SHALL use radial and conic gradients simulating theater projection
7. THE Application SHALL position lens flares absolutely with blur filter and screen blend mode
8. THE Application SHALL animate lens flares with floating scale and opacity changes over 9 seconds
9. THE Application SHALL apply scan lines effect using repeating horizontal lines at 4px intervals
10. WHEN viewport width is below 640px, THE Application SHALL reduce Film_Grain opacity to 0.12

---

### Requirement 16: Mobile Responsiveness

**User Story:** As a user on a mobile device, I want all content and interactions to work properly, so that I have a quality experience regardless of device.

#### Acceptance Criteria

1. THE Application SHALL use mobile-first responsive breakpoints at 640px (sm), 768px (md), and larger
2. THE Responsive_Layout SHALL stack all multi-column grid layouts into single column below 768px
3. THE Application SHALL scale typography using CSS clamp() with minimum, preferred, and maximum values
4. THE Application SHALL reduce Navigation_Bar padding and tracking on screens below 640px
5. THE Application SHALL hide decorative elements (runtime ticket, time display) on screens below 640px
6. THE Application SHALL enable horizontal scrolling for navigation links on narrow screens
7. THE Application SHALL reduce letterbox bar height from 52px to 36px on screens below 640px
8. THE Application SHALL adjust film grain and vignette intensity on mobile for performance
9. THE Application SHALL ensure all touch targets meet minimum 44px height for accessibility
10. THE Application SHALL use -webkit-tap-highlight-color: transparent to remove touch feedback artifacts
11. THE Application SHALL set touch-action: manipulation on interactive elements to prevent double-tap zoom
12. THE Application SHALL ensure email and contact links break properly on narrow screens

---

### Requirement 17: Time Display

**User Story:** As a user, I want to see the current time, so that I'm aware of the current moment while viewing the portfolio.

#### Acceptance Criteria

1. THE Application SHALL display current time in Navigation_Bar in IST timezone
2. THE Application SHALL format time as HH:MM:SS with 24-hour format
3. THE Application SHALL update time display every second
4. THE Application SHALL display "TC" (timecode) label before time value
5. THE Application SHALL use ember color for time value with monospace font
6. WHEN viewport width is below 768px, THE Application SHALL hide the time display
7. THE Application SHALL display fallback "--:--:-- IST" WHILE time is initializing

---

### Requirement 18: Performance and Accessibility

**User Story:** As a user, I want the application to load quickly and be accessible, so that I have a smooth, inclusive experience.

#### Acceptance Criteria

1. THE Application SHALL use font-display: swap for custom fonts to prevent invisible text
2. THE Application SHALL preload critical fonts from Google Fonts with woff2 format
3. THE Application SHALL use will-change: transform on animated elements for performance
4. THE Application SHALL respect prefers-reduced-motion media query disabling animations for users with motion sensitivity
5. WHEN prefers-reduced-motion is set, THE Application SHALL set animation and transition durations to 0.01ms
6. THE Application SHALL provide focus-visible styles with 2px ember outline at 4px offset
7. THE Application SHALL use semantic HTML with proper heading hierarchy (h1, h2, h3)
8. THE Application SHALL include aria-label attributes on icon-only buttons
9. THE Application SHALL include aria-pressed attributes on toggle buttons
10. THE Application SHALL use proper link targets (_blank) and rel="noreferrer" for external links
11. THE Application SHALL ensure all images and icons have appropriate alt text or aria-hidden attributes
12. THE Application SHALL use touch-action: manipulation to prevent 300ms click delay on mobile

---

### Requirement 19: CSS Architecture and Theming

**User Story:** As a developer, I want a maintainable CSS architecture with consistent theming, so that I can easily customize and extend styles.

#### Acceptance Criteria

1. THE Application SHALL define CSS custom properties for colors in oklch color space
2. THE Application SHALL define theme colors: paper (background), ink (foreground), ember (accent), rule (borders)
3. THE Application SHALL define custom properties for fonts: display (Fraunces), body (Inter Tight), mono (JetBrains Mono)
4. THE Application SHALL use Tailwind CSS v4 with inline @theme configuration
5. THE Application SHALL organize styles in layers: base, utilities
6. THE Application SHALL define utility classes for grain, vignette, letterbox, beam, flare, ticker, and animations
7. THE Application SHALL use consistent transition timing with cubic-bezier(0.2, 0.8, 0.2, 1) easing
8. THE Application SHALL define reusable animation keyframes for reveal, fadeUp, irisIn, flicker, countdown, and others
9. THE Application SHALL ensure all custom utilities are prefixed appropriately to avoid conflicts
10. THE Application SHALL use CSS containment (contain: layout) on ticker to prevent layout thrashing

---

### Requirement 20: Build and Deployment Configuration

**User Story:** As a developer, I want proper build configuration, so that I can deploy the application to production.

#### Acceptance Criteria

1. THE Application SHALL include vite.config.ts with appropriate build settings
2. THE Application SHALL configure TypeScript with strict mode and React JSX transform
3. THE Application SHALL generate optimized production bundle with code splitting
4. THE Application SHALL include .gitignore file excluding node_modules, dist, and build artifacts
5. THE Application SHALL include README.md with setup instructions and feature overview
6. THE Application SHALL configure base path for deployment to subdirectory if needed
7. THE Application SHALL generate sourcemaps for development builds only
8. THE Application SHALL configure asset inlining threshold for small images and fonts
9. THE Application SHALL include build script producing static HTML, CSS, and JS assets
10. THE Application SHALL be deployable to static hosting services (Vercel, Netlify, GitHub Pages)

---

## Additional Notes

### Design Principles
- **Cinematic Aesthetic**: Every design decision reinforces the film production theme through typography, effects, and interaction patterns
- **Performance-Conscious Effects**: Visual effects use CSS transforms and composited layers for 60fps animations
- **Progressive Enhancement**: Core content is accessible even if JavaScript or animations fail

### Technology Rationale
- **Vite**: Fast development server and optimized production builds
- **React**: Component-based architecture for maintainable UI
- **Tailwind CSS v4**: Utility-first styling with inline theme configuration
- **Lucide React**: Consistent, lightweight icon system
- **TypeScript**: Type safety and better developer experience

### Responsive Strategy
- Mobile-first breakpoints ensure content works on smallest screens first
- CSS clamp() provides fluid typography without media query proliferation
- Grid and flexbox layouts with column collapsing for adaptability
- Touch-optimized interaction targets (minimum 44px height)

### Accessibility Considerations
- Keyboard navigation support with visible focus indicators
- Screen reader friendly semantic HTML structure
- Motion reduction support for users with vestibular disorders
- Sufficient color contrast ratios for text readability
- Touch target sizing meets WCAG AA standards
