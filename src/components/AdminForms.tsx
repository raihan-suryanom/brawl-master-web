import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Player, Series } from "@/lib/api";

interface AdminFormsProps {
  players: Player[];
  series: Series[];
}

export function AdminForms({ players, series }: AdminFormsProps) {
  // Add Series state
  const [seriesName, setSeriesName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(false);

  // Add Game state
  const [selectedSeries, setSelectedSeries] = useState(series[0]?._id || "");
  const [gameNumber, setGameNumber] = useState(1);
  const [teamBlue, setTeamBlue] = useState<string[]>([]);
  const [teamRed, setTeamRed] = useState<string[]>([]);
  const [winner, setWinner] = useState<"teamBlue" | "teamRed">("teamBlue");
  const [gameLoading, setGameLoading] = useState(false);

  const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:7239/api";

  // Get participants for selected series
  const seriesParticipants = series.find(s => s._id === selectedSeries)?.participants || [];

  // Handle Add Series
  const handleAddSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!seriesName.trim() || selectedParticipants.length === 0) {
      alert("Please fill in series name and select participants");
      return;
    }

    setSeriesLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/series`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: seriesName,
          participants: selectedParticipants,
        }),
      });
      console.log({response})


      if (!response.ok) throw new Error("Failed to create series");

      alert("✅ Series created successfully!");
      // Redirect to series list
      window.location.href = "/";
    } catch (error) {
      alert("❌ Error creating series: " + (error as Error).message);
    } finally {
      setSeriesLoading(false);
    }
  };

  // Handle Add Game
  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (teamBlue.length < 3 || teamBlue.length > 4) {
      alert("Team Blue must have 3-4 players");
      return;
    }
    if (teamRed.length < 3 || teamRed.length > 4) {
      alert("Team Red must have 3-4 players");
      return;
    }

    // Check for duplicates
    const allPlayers = [...teamBlue, ...teamRed];
    const uniquePlayers = new Set(allPlayers);
    if (uniquePlayers.size !== allPlayers.length) {
      alert("❌ Players cannot be in both teams!");
      return;
    }

    setGameLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/series/${selectedSeries}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameNumber,
          teamBlue,
          teamRed,
          winner,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create game");
      }

      alert("✅ Game created successfully!");
      // Redirect to series detail
      window.location.href = `/series/${selectedSeries}`;
    } catch (error) {
      alert("❌ Error creating game: " + (error as Error).message);
    } finally {
      setGameLoading(false);
    }
  };

  // Toggle player selection
  const togglePlayer = (playerId: string, team: "participants" | "blue" | "red") => {
    if (team === "participants") {
      setSelectedParticipants(prev =>
        prev.includes(playerId)
          ? prev.filter(id => id !== playerId)
          : [...prev, playerId]
      );
    } else if (team === "blue") {
      setTeamBlue(prev =>
        prev.includes(playerId)
          ? prev.filter(id => id !== playerId)
          : prev.length < 4 ? [...prev, playerId] : prev
      );
    } else {
      setTeamRed(prev =>
        prev.includes(playerId)
          ? prev.filter(id => id !== playerId)
          : prev.length < 4 ? [...prev, playerId] : prev
      );
    }
  };

  return (
    <Tabs defaultValue="series" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="series">Add Series</TabsTrigger>
        <TabsTrigger value="game">Add Game</TabsTrigger>
      </TabsList>

      {/* Add Series Tab */}
      <TabsContent value="series">
        <Card>
          <CardHeader>
            <CardTitle>Create New Series</CardTitle>
            <CardDescription>Add a new brawl series with participants</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSeries} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="seriesName">Series Name</Label>
                <Input
                  id="seriesName"
                  placeholder="e.g., Series #6"
                  value={seriesName}
                  onChange={(e) => setSeriesName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Select Participants ({selectedParticipants.length} selected)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {players.map((player) => (
                    <button
                      key={player._id}
                      type="button"
                      onClick={() => togglePlayer(player._id, "participants")}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                        selectedParticipants.includes(player._id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={player.picture}
                        alt={player.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium">{player.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={seriesLoading} className="w-full">
                {seriesLoading ? "Creating..." : "Create Series"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Add Game Tab */}
      <TabsContent value="game">
        <Card>
          <CardHeader>
            <CardTitle>Add New Game</CardTitle>
            <CardDescription>Record a new game result</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddGame} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="series">Series</Label>
                  <select
                    id="series"
                    value={selectedSeries}
                    onChange={(e) => {
                      setSelectedSeries(e.target.value);
                      setTeamBlue([]);
                      setTeamRed([]);
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {series.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gameNumber">Game Number</Label>
                  <Input
                    id="gameNumber"
                    type="number"
                    min="1"
                    max="10"
                    value={gameNumber}
                    onChange={(e) => setGameNumber(parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team Blue */}
                <div className="space-y-2">
                  <Label>Team Blue ({teamBlue.length}/4)</Label>
                  <div className="space-y-2 border rounded-lg p-3 min-h-[200px]">
                    {seriesParticipants.map((player) => (
                      <button
                        key={player._id}
                        type="button"
                        onClick={() => togglePlayer(player._id, "blue")}
                        disabled={teamRed.includes(player._id)}
                        className={`flex items-center gap-2 p-2 w-full rounded border transition-colors ${
                          teamBlue.includes(player._id)
                            ? "border-blue-500 bg-blue-100 dark:bg-blue-950"
                            : teamRed.includes(player._id)
                            ? "opacity-50 cursor-not-allowed"
                            : "border-border hover:border-blue-500/50"
                        }`}
                      >
                        <img
                          src={player.picture}
                          alt={player.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm">{player.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Team Red */}
                <div className="space-y-2">
                  <Label>Team Red ({teamRed.length}/4)</Label>
                  <div className="space-y-2 border rounded-lg p-3 min-h-[200px]">
                    {seriesParticipants.map((player) => (
                      <button
                        key={player._id}
                        type="button"
                        onClick={() => togglePlayer(player._id, "red")}
                        disabled={teamBlue.includes(player._id)}
                        className={`flex items-center gap-2 p-2 w-full rounded border transition-colors ${
                          teamRed.includes(player._id)
                            ? "border-red-500 bg-red-100 dark:bg-red-950"
                            : teamBlue.includes(player._id)
                            ? "opacity-50 cursor-not-allowed"
                            : "border-border hover:border-red-500/50"
                        }`}
                      >
                        <img
                          src={player.picture}
                          alt={player.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm">{player.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="winner">Winner</Label>
                <select
                  id="winner"
                  value={winner}
                  onChange={(e) => setWinner(e.target.value as "teamBlue" | "teamRed")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="teamBlue">Team Blue</option>
                  <option value="teamRed">Team Red</option>
                </select>
              </div>

              <Button type="submit" disabled={gameLoading} className="w-full">
                {gameLoading ? "Creating..." : "Add Game"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
