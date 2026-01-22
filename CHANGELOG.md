# Changelog

All notable changes to the SLMGen UI project.

## [1.0.0] - 2026-01-23

### ✨ New Features

- **Live Dataset Chat Preview**
  - Added `DataPreview` component to visualize JSONL datasets as chat bubbles.
  - Implemented client-side parsing (first 10KB) to provide instant feedback without server upload.
  - Integrated into the Dashboard "Configure" step with validation badges.

- **Training Terminal Simulator**
  - Added `TerminalSimulator` component for the "Generate" step.
  - Features real-time typing animation of Unsloth training commands.
  - styled with a macOS-like terminal window and syntax highlighting.

- **Success Confetti**
  - Added `Confetti` component using Framer Motion.
  - Triggers a particle explosion effect when the notebook generation completes.
  - Integrated into the `NotebookReady` component.

### 🎨 UI/UX Improvements

- **Typography**
  - Switched global font to **JetBrains Mono** for a premium developer/IDE aesthetic.
  - Updated `layout.tsx` and `globals.css` to enable the font variable.

- **Animations**
  - Replaced CSS-based text diffusion with **Framer Motion variants** for smoother "blur-to-focus" reveal effects on the Home page.
  - Added "glowing pulse" effect to gradient text.

- **About Page**
  - Redesigned the "Team & Contributors" section.
  - Added dynamic GitHub avatar fetching for creator (@eshanized).
  - Added contributor profile for **Vedant Singh Rajput** (@vedanthq) with GitHub avatar and link.

### ⚙️ Technical

- **Next.js Configuration**
  - Updated `next.config.ts` to allow image loading from `github.com` and `avatars.githubusercontent.com`.

- **Refactoring**
  - Cleaned up unused CSS classes in `globals.css` after migrating to Framer Motion.
  - Added comprehensive JSDoc comments and contributor annotations to all modified files.

---

## [0.1.0] - Initial Beta
- Basic wizard flow (Upload -> Configure -> Recommend -> Generate).
- API integration with FastAPI backend.
