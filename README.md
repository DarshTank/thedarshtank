# thedarshtank

> A premium, high-aesthetic, cinematic developer portfolio and retro-projection dashboard. Styled after vintage movie theaters, glowing amber neon console readouts, and analog projection equipment.

---

## The Design Concept
**The Darsh Tank** is designed to feel like stepping into a dark cinema projection booth. Standard buttons, tabs, and boxes are replaced by glowing status lamps, movie clapperboards, monospace telemetry screens, and dynamic lever-style consoles. Every micro-interaction is optimized to feel alive, retro, and premium.

---

## 🚀 Key Features

### 1. Retro-Cinematic Portfolio (`/`)
* **Starred Cast & Starring**: Displaying core skills, frameworks, and roles as the "starring actors" of the developer's journey.
* **Tools of the Trade**: Monospaced listing of systems, languages, databases, and DevOps tools.
* **Note From The Desk**: A beautifully typeset personal commentary card styled like an editor's typewritten desk note.
* **End Credits**: Automatically scrolling list of mentors, institutions, and contributors fetched dynamically.
* **Filmography & Shoots**: Categorized, responsive layout showcasing code projects as "films" and locations/experience as "shoot schedules".
* **Animated DT Favicon**: A custom SVG favicon representing initials **DT** pulsing with a glowing orange light inside a spinning 24fps film reel.

### 2. Projection Console Admin Dashboard (`/admin`)
* **Clapperboard Auth Slate**: Custom credentials screen designed with high-contrast warning stripes, Monospace metadata fields (`Roll №01`, `Scene 00`, `Booth Access`), and amber projection lamp glows.
* **Active HUD Telemetry**: Header displays online status, real-time Google account credentials, server nodes, and coordinates (` Ahmedabad, IN`).
* **Console Lever Tabs**: Segmented tab control designed to look like heavy physical console levers that light up in neon orange when toggled.
* **Visibility Toggles**: Real-time Firestore visibility switches placed beside the Edit & Delete controls to instantly control which projects/shoots display on the homepage.
* **Resume Dropzone HUD**: Dashed console borders showcasing upload status, link logs, and file downloads.

---

## 🛠️ Tech Stack
* **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with Turbopack compilation.
* **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore database and Google Authentication).
* **Styling**: Tailwind CSS & custom utility animations in Vanilla CSS.
* **Emails**: [Resend](https://resend.com/) API client-to-server email integration.
* **Icons**: [Lucide React](https://lucide.dev/) for high-contrast HUD iconography.

---

## 🔑 Environment Configuration
The application is configured to run all APIs and credentials exclusively from the root `.env` file (local overrides in `.env.local` are deactivated to maintain project consistency).

Create a `.env` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Email Integration API Key
RESEND_API_KEY=your-resend-api-key
```

---

## 📦 Project Architecture
```
thedarshtank/
├── app/
│   ├── admin/
│   │   └── page.tsx              # Projection Console Admin Screen
│   ├── api/
│   │   ├── contact/
│   │   │   └── route.ts          # Resend Email Direct Client Endpoint
│   │   └── upload-resume/
│   │       └── route.ts          # PDF Resume Upload Service
│   ├── layout.tsx                # Page Layout & Metadata Links
│   ├── globals.css               # Scanline & CRT custom styling
│   ├── icon.svg                  # Animated SVG favicon
│   └── page.tsx                  # Main Portfolio Theater Page
├── lib/
│   └── firebase.ts               # Firebase App & Firestore Clients
├── public/                       # Static assets
├── .env                          # EXCLUSIVE API & Key configuration
└── README.md                     # Documentation
```

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the next available port indicated in the terminal) to view the application.

### 3. Production Build
Ensure all TypeScript definitions and environments match:
```bash
npm run build
```

---

## 🎨 Visual System & Palette
* **Accents**: Amber Orange (`#ff7b00`, `rgb(255, 123, 0)`)
* **Dark Backdrop**: Midnight Theater Gray (`#050505`, `#0c0c0c`)
* **Rules & Outlines**: Aged projector zinc (`rgba(255, 255, 255, 0.08)`)
* **Fonts**: `Inter Tight` (Visual headings) & `JetBrains Mono` (Terminal readouts, data metrics)
* **Effects**: Glassmorphic backdrops (`backdrop-blur-md`), dynamic CRT scanlines, and animated radial glow gradients.
#
