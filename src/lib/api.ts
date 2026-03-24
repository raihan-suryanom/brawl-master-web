const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:7239/api";

export async function fetcher<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  // Players
  getPlayers: () => fetcher("/players"),
  getPlayer: (id: string) => fetcher(`/players/${id}`),
  
  // Series
  getSeries: () => fetcher("/series"),
  getSeriesById: (id: string) => fetcher(`/series/${id}`),
  
  // Games
  getGames: (seriesId: string, maxGameNumber?: number) => 
    fetcher(`/series/${seriesId}/games${maxGameNumber ? `?maxGameNumber=${maxGameNumber}` : ""}`),
  
  // Stats
  getSeriesStats: (seriesId: string, maxGameNumber?: number) => 
    fetcher(`/series/${seriesId}/stats${maxGameNumber ? `?maxGameNumber=${maxGameNumber}` : ""}`),
  getSeriesPtsProgression: (seriesId: string, maxGameNumber?: number) => 
    fetcher(`/series/${seriesId}/pts-progression${maxGameNumber ? `?maxGameNumber=${maxGameNumber}` : ""}`),
  getPlayerStats: (playerId: string, seriesId?: string) => 
    fetcher(`/players/${playerId}/stats${seriesId ? `?seriesId=${seriesId}` : ""}`),
  getPlayerStatsRange: (playerId: string, fromSeriesId: string, toSeriesId: string) =>
    fetcher(`/players/${playerId}/stats?fromSeriesId=${fromSeriesId}&toSeriesId=${toSeriesId}`),
  getPlayerCombinations: (playerId: string, size: 2 | 3, seriesId?: string) =>
    fetcher(`/players/${playerId}/combinations?size=${size}${seriesId ? `&seriesId=${seriesId}` : ""}`),
  getPlayerCombinationsRange: (playerId: string, size: 2 | 3, fromSeriesId: string, toSeriesId: string) =>
    fetcher(`/players/${playerId}/combinations?size=${size}&fromSeriesId=${fromSeriesId}&toSeriesId=${toSeriesId}`),
  getPlayerPositionHistory: (playerId: string, fromSeriesId?: string, toSeriesId?: string) => {
    if (fromSeriesId && toSeriesId) {
      return fetcher(`/players/${playerId}/position-history?fromSeriesId=${fromSeriesId}&toSeriesId=${toSeriesId}`);
    }
    return fetcher(`/players/${playerId}/position-history`);
  },
  getPlayerGameProgression: (playerId: string, fromSeriesId?: string, toSeriesId?: string) => {
    if (fromSeriesId && toSeriesId) {
      return fetcher(`/players/${playerId}/game-progression?fromSeriesId=${fromSeriesId}&toSeriesId=${toSeriesId}`);
    }
    return fetcher(`/players/${playerId}/game-progression`);
  },
  getPlayerPerformanceTrends: (playerId: string) =>
    fetcher(`/players/${playerId}/performance-trends`),
  getPlayerClutchStats: (playerId: string) =>
    fetcher(`/players/${playerId}/clutch-stats`),
  getPlayerComebackAnalysis: (playerId: string) =>
    fetcher(`/players/${playerId}/comeback-analysis`),
  // Series difficulty
  getSeriesDifficulty: (seriesId: string) =>
    fetcher(`/series/${seriesId}/stats/difficulty`),
  getAllSeriesDifficulty: () =>
    fetcher(`/aggregate-stats/series-difficulty`),
  // Aggregate stats
  getBestCombinations: (size: 2 | 3, seriesId?: string) => {
    if (seriesId) {
      return fetcher(`/aggregate-stats/best-combinations?size=${size}&fromSeriesId=${seriesId}&toSeriesId=${seriesId}`);
    }
    return fetcher(`/aggregate-stats/best-combinations?size=${size}`);
  },
  getBestCombinationsRange: (size: 2 | 3, fromSeriesId: string, toSeriesId: string) =>
    fetcher(`/aggregate-stats/best-combinations?size=${size}&fromSeriesId=${fromSeriesId}&toSeriesId=${toSeriesId}`),
};

export type Player = {
  _id: string;
  name: string;
  picture: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type Series = {
  _id: string;
  name: string;
  participants: Player[];
  createdAt: string;
  updatedAt: string;
};

export type Game = {
  _id: string;
  seriesId: string;
  gameNumber: number;
  teamBlue: Player[];
  teamRed: Player[];
  winner: "teamBlue" | "teamRed";
  createdAt: string;
  updatedAt: string;
};

export type PlayerStats = {
  playerId: string;
  name: string;
  picture: string;
  color: string;
  totalWin: number;
  highestWinStreak: number;
  highestLoseStreak: number;
  firstLossGameNumber: number; // Old tiebreaker (series 1-16)
  lastGameResult: "W" | "L"; // New tiebreaker (series 17+)
  pts: number;
  totalGames: number;
  winRate: number;
  minPossiblePts?: number;
  maxPossiblePts?: number;
  zone?: "none" | "champion" | "safe" | "last";
  positionChange?: number; // Positive = moved up, Negative = moved down, 0 = no change
  lastFiveGames?: Array<{
    gameNumber: number;
    result: "W" | "L";
  }>;
};

export type PlayerCombination = {
  players: Array<{
    id: string;
    name: string;
    picture: string;
    color: string;
  }>;
  wins: number;
  losses: number;
  totalGames: number;
  winRate: number;
  score?: number;
  insufficientData?: boolean;
};

export type PtsProgression = {
  id: string;
  name: string;
  color: string;
  progression: Array<{
    gameNumber: number;
    pts: number;
    win: number;
    ws: number;
    ls: number;
  }>;
};

export type GameProgression = {
  gameIndex: number;
  gameNumber: number;
  seriesName: string;
  seriesId: string;
  result: "W" | "L";
  ptsGained: number;
  cumulativePts: number;
};

export type PlayerRating = {
  tier: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  label: string;
  color: string;
};

export type SeriesPerformance = {
  seriesId: string;
  seriesName: string;
  seriesDate: string;
  pts: number;
  wins: number;
  losses: number;
  winRate: number;
  winStreak: number;
  loseStreak: number;
};

export type PerformanceTrends = {
  seriesPerformance: SeriesPerformance[];
  rating: PlayerRating;
  avgPts: number;
  peakPts: number;
  peakSeries: string | null;
  winRate: number;
  consistency: number;
  form: {
    trend: 'improving' | 'declining' | 'stable' | 'neutral';
    change: number;
  };
  totalSeries: number;
};

export type ClutchStats = {
  closeGameWinRate: number;
  closeGamesPlayed: number;
  closeGamesWon: number;
  clutchRating: string;
};

export type DifficultyFactor = {
  value: number;
  score: number;
  description: string;
};

export type SeriesDifficulty = {
  difficultyScore: number;
  difficultyTier: 'Insane' | 'Brutal' | 'Tough' | 'Average' | 'Easy' | 'Unknown' | 'No Data';
  difficultyEmoji: string;
  difficultyColor: string;
  seriesName?: string;
  seriesId?: string;
  factors: {
    competitiveness: DifficultyFactor;
    closeFinishes: DifficultyFactor;
    ptsVariance: DifficultyFactor;
    positionChanges: DifficultyFactor;
  };
};

export type PositionPoint = {
  gameNumber: number;
  position: number;
  change: number;
};

export type SeriesComebackBreakdown = {
  seriesId: string;
  seriesName: string;
  hadComeback: boolean;
  comebackStrength: number;
  hadThrow: boolean;
  throwSeverity: number;
  momentumShifts: number;
  progression: PositionPoint[];
};

export type ComebackAnalysis = {
  totalSeries: number;
  comebacks: number;
  throws: number;
  comebackRate: number;
  throwRate: number;
  avgComebackStrength: number;
  avgThrowSeverity: number;
  mentalToughness: 'Elite' | 'Strong' | 'Solid' | 'Shaky' | 'Fragile' | 'N/A';
  momentumShifts: number;
  seriesBreakdown: SeriesComebackBreakdown[];
};