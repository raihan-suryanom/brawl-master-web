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
  getGames: (seriesId: string) => fetcher(`/series/${seriesId}/games`),
  
  // Stats
  getSeriesStats: (seriesId: string) => fetcher(`/series/${seriesId}/stats`),
  getSeriesPtsProgression: (seriesId: string) => fetcher(`/series/${seriesId}/pts-progression`),
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
  firstLossGameNumber: number;
  pts: number;
  totalGames: number;
  winRate: number;
  maxPossiblePts?: number;
  zone?: "none" | "champion" | "safe" | "last";
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
  points: number;
  gameNumber: number;
  seriesName: string;
  seriesId: string;
  result: "W" | "L";
  ptsGained: number;
  cumulativePts: number;
  totalWins: number;
  highestWinStreak: number;
  highestLoseStreak: number;
};