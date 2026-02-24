# Brawl Master Tracker - Frontend

Astro SSR frontend with shadcn/ui and Recharts for MLBB Brawl match tracking.

## Tech Stack

- **Astro** - SSR framework
- **React** - UI islands
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Charts library

## Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:7239`

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:4321`

## Pages

- `/` - Home page with all series
- `/series/[id]` - Series detail with leaderboard, charts, and games
- `/players` - All players list
- `/players/[id]` - Player detail with stats and combinations
- `/stats` - Overall stats with series filter

## Features

### Series Detail Page
- Leaderboard table (ranked by points)
- Points bar chart
- Win distribution pie chart
- Complete games list with team compositions

### Player Detail Page
- Overall statistics (wins, streaks, points, win rate)
- Best duo partners (2-player combinations)
- Best trio combinations (3-player combinations)

### Stats Page
- View all players stats
- Filter by specific series or view aggregate across all series
- Quick overview cards for each player

## Components

### UI Components (shadcn/ui)
- `Button` - Interactive button
- `Card` - Container component
- `Table` - Data table
- `Select` - Dropdown selector

### Custom Components
- `LeaderboardTable` - Rankings table
- `PointsBarChart` - Bar chart for points comparison
- `WinRatePieChart` - Pie chart for win distribution
- `CombinationsTable` - Player combinations table

## API Integration

All API calls are handled through `/src/lib/api.ts` which connects to the backend at `http://localhost:7239/api`.

## Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── LeaderboardTable.tsx
│   ├── PointsBarChart.tsx
│   ├── WinRatePieChart.tsx
│   └── CombinationsTable.tsx
├── layouts/
│   └── Layout.astro     # Main layout with navigation
├── lib/
│   ├── api.ts           # API client and types
│   └── utils.ts         # Utility functions
├── pages/
│   ├── index.astro      # Home page
│   ├── series/
│   │   └── [id].astro   # Series detail
│   ├── players/
│   │   ├── index.astro  # Players list
│   │   └── [id].astro   # Player detail
│   └── stats.astro      # Overall stats
└── styles/
    └── globals.css      # Global styles with Tailwind
```
