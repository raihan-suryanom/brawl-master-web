import { Button } from "@/components/ui/button";

export function CacheManagement() {
  const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:7239/api";

  // Clear all cache
  const handleClearCache = async () => {
    const confirmed = window.confirm(
      "⚠️ WARNING: This will clear ALL cache!\n\nAre you sure you want to continue?"
    );
    
    if (!confirmed) return;

    try {
      const adminPassword = sessionStorage.getItem("adminPassword");
      
      const response = await fetch(`${API_BASE_URL}/admin/clear-cache`, {
        method: "POST",
        headers: {
          "x-admin-password": adminPassword || "",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error === "INVALID_PASSWORD") {
          alert("❌ Invalid admin password. Please refresh and login again.");
          sessionStorage.removeItem("adminPassword");
          window.location.reload();
          return;
        }
        throw new Error("Failed to clear cache");
      }

      const result = await response.json();
      alert(`✅ ${result.message}`);
    } catch (error) {
      alert("❌ Error clearing cache: " + (error as Error).message);
    }
  };

  // Clear specific cache type
  const handleClearCacheType = async (type: string) => {
    try {
      const adminPassword = sessionStorage.getItem("adminPassword");
      
      const response = await fetch(`${API_BASE_URL}/admin/clear-cache/${type}`, {
        method: "POST",
        headers: {
          "x-admin-password": adminPassword || "",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error === "INVALID_PASSWORD") {
          alert("❌ Invalid admin password. Please refresh and login again.");
          sessionStorage.removeItem("adminPassword");
          window.location.reload();
          return;
        }
        throw new Error("Failed to clear cache");
      }

      const result = await response.json();
      alert(`✅ ${result.message}`);
    } catch (error) {
      alert("❌ Error clearing cache: " + (error as Error).message);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-dashed">
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground opacity-50">Cache Management</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleClearCacheType("series")}
            className="text-xs px-3 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors opacity-40 hover:opacity-100"
          >
            Clear Series
          </button>
          <button
            type="button"
            onClick={() => handleClearCacheType("games")}
            className="text-xs px-3 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors opacity-40 hover:opacity-100"
          >
            Clear Games
          </button>
          <button
            type="button"
            onClick={() => handleClearCacheType("stats")}
            className="text-xs px-3 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors opacity-40 hover:opacity-100"
          >
            Clear Stats
          </button>
          <button
            type="button"
            onClick={() => handleClearCacheType("players")}
            className="text-xs px-3 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors opacity-40 hover:opacity-100"
          >
            Clear Players
          </button>
          <button
            type="button"
            onClick={() => handleClearCacheType("progression")}
            className="text-xs px-3 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors opacity-40 hover:opacity-100"
          >
            Clear Progression
          </button>
          <button
            type="button"
            onClick={handleClearCache}
            className="text-xs px-3 py-1 rounded border border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-40 hover:opacity-100"
          >
            ⚠️ Clear ALL
          </button>
        </div>
      </div>
    </div>
  );
}