import type { Series } from "@/lib/api";

interface SeriesNavigationProps {
  allSeries: Series[];
  currentSeriesId: string;
}

export function SeriesNavigation({ 
  allSeries, 
  currentSeriesId
}: SeriesNavigationProps) {
  // Sort series by createdAt
  const sortedSeries = [...allSeries].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const currentIndex = sortedSeries.findIndex(s => s._id === currentSeriesId);
  const prevSeries = currentIndex > 0 ? sortedSeries[currentIndex - 1] : null;
  const nextSeries = currentIndex < sortedSeries.length - 1 ? sortedSeries[currentIndex + 1] : null;
  const currentSeries = sortedSeries[currentIndex];

  const navigateToSeries = (seriesId: string) => {
    window.location.href = `/series/${seriesId}`;
  };

  return (
    <div className="sticky top-16 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4">
      {/* Series Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => prevSeries && navigateToSeries(prevSeries._id)}
          disabled={!prevSeries}
          className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
        >
          ← Previous
        </button>

        <div className="text-center">
          <h2 className="text-lg font-bold">{currentSeries?.name}</h2>
          <p className="text-xs text-muted-foreground">
            Series {currentIndex + 1} of {sortedSeries.length}
          </p>
        </div>

        <button
          onClick={() => nextSeries && navigateToSeries(nextSeries._id)}
          disabled={!nextSeries}
          className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
        >
          Next →
        </button>
      </div>
    </div>
  );
}