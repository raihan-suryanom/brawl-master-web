import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Player, Series } from "@/lib/api";

interface TeamPickerProps {
  series: Series[];
}

export function TeamPicker({ series }: TeamPickerProps) {
  // Get latest series by createdAt
  const getLatestSeries = () => {
    if (series.length === 0) return "";
    const sorted = [...series].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sorted[0]._id;
  };

  const [selectedSeries, setSelectedSeries] = useState(getLatestSeries());
  const [isSpinning, setIsSpinning] = useState(false);
  const [teamBlue, setTeamBlue] = useState<Player[]>([]);
  const [teamRed, setTeamRed] = useState<Player[]>([]);
  const [hasResult, setHasResult] = useState(false);
  const [shufflingPlayers, setShufflingPlayers] = useState<Player[]>([]);
  const [separationMode, setSeparationMode] = useState<'none' | 'survival' | 'final-battle'>('none');

  const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:7239/api";

  // Get participants for selected series
  const participants = series.find(s => s._id === selectedSeries)?.participants || [];

  // Check team separation modes
  const checkTeamSeparationMode = async (): Promise<{ 
    mode: 'none' | 'survival' | 'final-battle';
    rank5?: Player; 
    rank6?: Player;
  }> => {
    try {
      // Fetch games to check count
      const gamesResponse = await fetch(`${API_BASE_URL}/series/${selectedSeries}/games`);
      if (!gamesResponse.ok) return { mode: 'none' };
      
      const games = await gamesResponse.json();
      const gamesPlayed = games.length;
      
      // Fetch current standings
      const statsResponse = await fetch(`${API_BASE_URL}/series/${selectedSeries}/stats`);
      if (!statsResponse.ok) return { mode: 'none' };
      
      const stats = await statsResponse.json();
      
      if (stats.length < 6) return { mode: 'none' };
      
      // Get rank 5 and 6 players (last two positions)
      const rank5PlayerId = stats[4].playerId;
      const rank6PlayerId = stats[5].playerId;
      
      const rank5 = participants.find(p => p._id === rank5PlayerId);
      const rank6 = participants.find(p => p._id === rank6PlayerId);
      
      // Check FINAL BATTLE MODE: Top 4 guaranteed safe (only 2 left fighting)
      const top4Safe = stats.slice(0, 4).every((s: any) => 
        s.zone === "safe" || s.zone === "champion"
      );
      
      if (top4Safe) {
        return { mode: 'final-battle', rank5, rank6 };
      }
      
      // Check SURVIVAL MODE: After game 4, always separate bottom 2
      if (gamesPlayed >= 4) {
        return { mode: 'survival', rank5, rank6 };
      }
      
      return { mode: 'none' };
    } catch (error) {
      console.error("Error checking team separation mode:", error);
      return { mode: 'none' };
    }
  };

  // Shuffle array helper
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Check if team combination matches previous games
  const isSameCombination = (blue: string[], red: string[], prevBlue: string[], prevRed: string[]): boolean => {
    const prevBlueSet = new Set(prevBlue);
    const prevRedSet = new Set(prevRed);

    // Check if same players in same teams
    const sameBlue = blue.length === prevBlue.length && blue.every(p => prevBlueSet.has(p));
    const sameRed = red.length === prevRed.length && red.every(p => prevRedSet.has(p));

    // Also check reversed (Blue became Red, Red became Blue)
    const reversedBlue = blue.length === prevRed.length && blue.every(p => prevRedSet.has(p));
    const reversedRed = red.length === prevBlue.length && red.every(p => prevBlueSet.has(p));

    return (sameBlue && sameRed) || (reversedBlue && reversedRed);
  };

  // Get all duo combinations from a team
  const getDuoCombinations = (team: string[]): Set<string> => {
    const duos = new Set<string>();
    for (let i = 0; i < team.length; i++) {
      for (let j = i + 1; j < team.length; j++) {
        // Sort IDs to ensure consistent duo representation
        const duo = [team[i], team[j]].sort().join('-');
        duos.add(duo);
      }
    }
    return duos;
  };

  // Check if any duo appears in both last 2 games
  const hasForbiddenDuo = (blue: string[], red: string[], lastGames: any[]): boolean => {
    if (lastGames.length < 2) return false;

    // Get duos from current teams
    const currentBlueDuos = getDuoCombinations(blue);
    const currentRedDuos = getDuoCombinations(red);
    const allCurrentDuos = new Set([...currentBlueDuos, ...currentRedDuos]);

    // Get duos from last 2 games
    const game1Blue = lastGames[0].teamBlue.map((p: any) => p._id);
    const game1Red = lastGames[0].teamRed.map((p: any) => p._id);
    const game1Duos = new Set([
      ...getDuoCombinations(game1Blue),
      ...getDuoCombinations(game1Red)
    ]);

    const game2Blue = lastGames[1].teamBlue.map((p: any) => p._id);
    const game2Red = lastGames[1].teamRed.map((p: any) => p._id);
    const game2Duos = new Set([
      ...getDuoCombinations(game2Blue),
      ...getDuoCombinations(game2Red)
    ]);

    // Find duos that appeared in BOTH last 2 games
    const repeatedDuos = new Set<string>();
    game1Duos.forEach(duo => {
      if (game2Duos.has(duo)) {
        repeatedDuos.add(duo);
      }
    });

    // Check if current teams have any repeated duo (would be 3rd time)
    for (const duo of allCurrentDuos) {
      if (repeatedDuos.has(duo)) {
        return true; // This duo would appear 3x in a row - FORBIDDEN!
      }
    }

    return false;
  };

  // Fetch last N games and validate combination
  const getValidCombination = async (): Promise<{ blue: Player[], red: Player[] } | null> => {
    try {
      // Check team separation mode
      const separationCheck = await checkTeamSeparationMode();
      setSeparationMode(separationCheck.mode);
      
      // Fetch last 2 games
      const response = await fetch(`${API_BASE_URL}/series/${selectedSeries}/games`);
      if (!response.ok) throw new Error("Failed to fetch games");
      
      const games = await response.json();
      const lastGames = games.slice(-2); // Get last 2 games

      // Try to find valid combination (max 100 attempts for duo check)
      for (let attempt = 0; attempt < 100; attempt++) {
        let blue: Player[];
        let red: Player[];
        
        const shouldSeparate = separationCheck.mode !== 'none';
        
        if (shouldSeparate && separationCheck.rank5 && separationCheck.rank6) {
          // SEPARATION MODE: Rank 5 & 6 MUST be on different teams!
          const rank5 = separationCheck.rank5;
          const rank6 = separationCheck.rank6;
          
          // Get remaining players (rank 1-4)
          const others = participants.filter(p => 
            p._id !== rank5._id && p._id !== rank6._id
          );
          
          // Shuffle others
          const shuffledOthers = shuffleArray(others);
          
          // Randomly decide which team gets rank5 vs rank6
          const rank5InBlue = Math.random() < 0.5;
          
          if (rank5InBlue) {
            // Rank 5 in Blue, Rank 6 in Red
            blue = [rank5, ...shuffledOthers.slice(0, 2)];
            red = [rank6, ...shuffledOthers.slice(2, 4)];
          } else {
            // Rank 6 in Blue, Rank 5 in Red
            blue = [rank6, ...shuffledOthers.slice(0, 2)];
            red = [rank5, ...shuffledOthers.slice(2, 4)];
          }
        } else {
          // Normal random shuffle
          const shuffled = shuffleArray(participants);
          const mid = Math.floor(shuffled.length / 2);
          blue = shuffled.slice(0, mid);
          red = shuffled.slice(mid);
        }

        const currentBlue = blue.map(p => p._id);
        const currentRed = red.map(p => p._id);

        // Check 1: No same full combination
        let isDuplicate = false;
        for (const game of lastGames) {
          const prevBlue = game.teamBlue.map((p: any) => p._id);
          const prevRed = game.teamRed.map((p: any) => p._id);

          if (isSameCombination(currentBlue, currentRed, prevBlue, prevRed)) {
            isDuplicate = true;
            break;
          }
        }

        if (isDuplicate) continue;

        // Check 2: No duo appearing 3x in a row
        if (lastGames.length >= 2) {
          if (hasForbiddenDuo(currentBlue, currentRed, lastGames)) {
            continue; // This has a duo that would appear 3x - try again
          }
        }

        // Passed all checks!
        return { blue, red };
      }

      // If all attempts failed, return any combination (edge case)
      const shuffled = shuffleArray(participants);
      const mid = Math.floor(shuffled.length / 2);
      return { blue: shuffled.slice(0, mid), red: shuffled.slice(mid) };

    } catch (error) {
      console.error("Error validating combination:", error);
      // Fallback: just shuffle
      const shuffled = shuffleArray(participants);
      const mid = Math.floor(shuffled.length / 2);
      return { blue: shuffled.slice(0, mid), red: shuffled.slice(mid) };
    }
  };

  // Handle shuffle with animation
  const handleShuffle = async () => {
    if (participants.length < 6) {
      alert("⚠️ Need at least 6 participants for team picking!");
      return;
    }

    setIsSpinning(true);
    setHasResult(false);

    // Animate shuffling (show random players for 2 seconds)
    const animationDuration = 2000;
    const interval = 100;
    let elapsed = 0;

    const animationInterval = setInterval(() => {
      const shuffled = shuffleArray(participants);
      setShufflingPlayers(shuffled);
      elapsed += interval;

      if (elapsed >= animationDuration) {
        clearInterval(animationInterval);
      }
    }, interval);

    // Get valid combination
    const result = await getValidCombination();

    // Wait for animation to complete
    setTimeout(() => {
      if (result) {
        setTeamBlue(result.blue);
        setTeamRed(result.red);
        setHasResult(true);
      }
      setIsSpinning(false);
      setShufflingPlayers([]);
    }, animationDuration);
  };

  // Handle add game
  const handleConfirm = () => {
    // Store team data in sessionStorage for admin page
    const teamData = {
      seriesId: selectedSeries,
      teamBlue: teamBlue.map(p => p._id),
      teamRed: teamRed.map(p => p._id),
    };
    sessionStorage.setItem('pickedTeams', JSON.stringify(teamData));
    
    // Smooth scroll to Admin Panel section (at top of page)
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Small delay to let scroll finish, then trigger custom event
    setTimeout(() => {
      // Dispatch event to notify AdminForms to switch tab and fill form
      window.dispatchEvent(new CustomEvent('teamPickerConfirmed'));
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Series Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Series</CardTitle>
          <CardDescription>Choose which series to pick teams for</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="series">Series</Label>
              <select
                id="series"
                value={selectedSeries}
                onChange={(e) => {
                  setSelectedSeries(e.target.value);
                  setHasResult(false);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {[...series]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.participants.length} players)
                    </option>
                  ))
                }
              </select>
            </div>

            <Button
              onClick={handleShuffle}
              disabled={isSpinning || participants.length < 6}
              className="w-full"
              size="lg"
            >
              {isSpinning ? "🎲 Shuffling..." : "🎲 Shuffle Teams"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Spinning Animation */}
      {isSpinning && (
        <Card>
          <CardHeader>
            <CardTitle>Shuffling Teams...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-600 dark:text-blue-400">Team Blue</h3>
                <div className="space-y-2 border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/30 min-h-[200px]">
                  {shufflingPlayers.slice(0, Math.floor(shufflingPlayers.length / 2)).map((player, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-800 animate-pulse">
                      <img
                        src={player.picture}
                        alt={player.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium">{player.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-red-600 dark:text-red-400">Team Red</h3>
                <div className="space-y-2 border rounded-lg p-4 bg-red-50 dark:bg-red-950/30 min-h-[200px]">
                  {shufflingPlayers.slice(Math.floor(shufflingPlayers.length / 2)).map((player, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-red-200 dark:border-red-800 animate-pulse">
                      <img
                        src={player.picture}
                        alt={player.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium">{player.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {hasResult && !isSpinning && (
        <Card>
          <CardHeader>
            <CardTitle>🎉 Teams Ready!</CardTitle>
            <CardDescription>Review teams and confirm to add game</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Separation Mode Indicators */}
              {separationMode === 'final-battle' && (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg border-2 border-orange-600 shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚔️</span>
                    <div>
                      <h4 className="font-bold text-lg">FINAL BATTLE MODE!</h4>
                      <p className="text-sm opacity-90">
                        Top 4 players are safe. Only 2 left fighting for survival!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {separationMode === 'survival' && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg border-2 border-purple-600 shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🔥</span>
                    <div>
                      <h4 className="font-bold text-lg">SURVIVAL MODE ACTIVE!</h4>
                      <p className="text-sm opacity-90">
                        Bottom 2 positions have been separated to fight for their spot!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team Blue */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                    Team Blue ({teamBlue.length})
                  </h3>
                  <div className="space-y-2 border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/30">
                    {teamBlue.map((player) => (
                      <div key={player._id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800">
                        <img
                          src={player.picture}
                          alt={player.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{player.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Red */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-red-600 dark:text-red-400">
                    Team Red ({teamRed.length})
                  </h3>
                  <div className="space-y-2 border rounded-lg p-4 bg-red-50 dark:bg-red-950/30">
                    {teamRed.map((player) => (
                      <div key={player._id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                        <img
                          src={player.picture}
                          alt={player.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-medium">{player.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleShuffle} variant="outline" className="flex-1">
                  🔄 Re-shuffle
                </Button>
                <Button onClick={handleConfirm} className="flex-1">
                  ✅ Confirm & Go to Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}