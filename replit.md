# ΑΠΟΛΕΛΕ PRO

A Next.js military service management app (Greek Armed Forces). Migrated from Vercel to Replit.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **Package Manager**: pnpm

## Architecture

- `app/` — Next.js App Router pages and layouts
- `components/` — UI components (tabs, modals, navigation)
- `lib/` — Utility functions
- `hooks/` — Custom React hooks
- `public/` — Static assets (icons, manifest)
- `styles/` — Global CSS

## Features (Tabs)

- **Service** — Service/duty tracking
- **Calendar/Duties** — Calendar view of duties
- **Notes** — Note-taking
- **Profile** — User profile
- **Expenses** — Expense tracking

## Replit Setup

- Dev server runs on port `5000` with host `0.0.0.0` for Replit proxy compatibility
- Workflow: `pnpm run dev`
- Vercel Analytics removed (not compatible outside Vercel infrastructure)

## Running

The app starts automatically via the "Start application" workflow.
