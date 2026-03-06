# Redesign Design System: ΑΠΟΛΕΛΕ PRO

## 1. Core Concept
The redesign focuses on a **Tactical Minimalist** aesthetic. It combines the rugged, functional nature of military applications with modern, clean, and compact UI patterns. The goal is to provide a high-density information display that remains readable and easy to navigate under various conditions (e.g., low light, quick glances).

## 2. Color Palette
We are moving from a generic dark theme to a **Deep Forest Tactical** palette.

| Role | Color | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Background** | Obsidian | `#050705` | Main app background |
| **Surface** | Gunmetal Green | `#0D110D` | Cards, modals, and elevated surfaces |
| **Primary** | Tactical Lime | `#A3E635` | Primary actions, progress, highlights |
| **Secondary** | Muted Olive | `#3F4F3F` | Secondary buttons, inactive states |
| **Accent** | Stealth Blue | `#38BDF8` | Informational highlights (e.g., leaves) |
| **Destructive** | Signal Red | `#F87171` | Errors, deletions |
| **Text Primary** | Frost White | `#F8FAFC` | Main headings and body text |
| **Text Muted** | Slate Gray | `#94A3B8` | Secondary info, labels |

## 3. Typography
- **Font Family**: `Inter` or `Geist` (Sans-serif) for maximum legibility.
- **Scale**:
  - **H1**: 20px, Bold (Page Titles)
  - **H2**: 16px, Semi-bold (Section Headers)
  - **Body**: 14px, Regular (Main Content)
  - **Caption**: 12px, Medium (Labels, Secondary Info)
  - **Micro**: 10px, Bold (Uppercase tags, status)

## 4. Components & Layout
- **Compactness**: Reduce padding and margins to fit more content on mobile screens without clutter.
- **Glassmorphism**: Use subtle blur effects (`backdrop-filter`) for navigation and overlays to maintain context.
- **Borders**: Use thin, low-contrast borders (`1px solid rgba(255,255,255,0.05)`) instead of heavy shadows.
- **Interactive Elements**: Ensure all buttons meet the 44x44px minimum touch target while appearing visually smaller.
- **Progress Ring**: Refine the "LELEmeter" with a cleaner, thinner stroke and better typography.

## 5. UX Improvements
- **Information Hierarchy**: Prioritize "Days Remaining" and "Today's Duty" on the main screen.
- **Navigation**: Keep the bottom nav but make it more compact with clearer active states.
- **Forms**: Use inline editing or more focused modals to reduce context switching.
- **Haptics**: Maintain existing haptic feedback for a tactile feel.
