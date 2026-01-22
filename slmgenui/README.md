# SLMGEN UI

The next-generation frontend for SLMGEN, built with Next.js 16 and React 19.

## ✨ New in v1.0

- **JetBrains Mono Typography** - Premium "IDE" aesthetic for developers.
- **Data Preview** - Live chat bubbles for verifying JSONL uploads instantly.
- **Terminal Simulator** - Real-time training command simulation.
- **Framer Motion Animations** - Smooth transitions and diffusion reveal effects.

## 🛠️ Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + Custom "Everblush" Theme
- **Motion**: Framer Motion
- **Icons**: Lucide React
- **Validation**: Zod
- **Font**: JetBrains Mono

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   ```
   *Set `NEXT_PUBLIC_API_URL` to your backend URL (default: http://localhost:8000)*

3. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 📁 Key Components

- `src/components/upload-zone.tsx` - File upload with client-side preview reading
- `src/components/data-preview.tsx` - Chat bubble visualization
- `src/components/terminal-simulator.tsx` - Training terminal animation
- `src/components/confetti.tsx` - Success celebration
- `src/hooks/use-session.ts` - Configuring state management

## 👥 Contributors

- **Vedant Singh Rajput**
- **Eshan Roy**
