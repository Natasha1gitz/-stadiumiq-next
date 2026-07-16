import type { TransitData } from '@/lib/domain/schemas';

/** Props for the SustainabilityStats component. */
interface SustainabilityStatsProps {
  /** Array of transit hub data to aggregate. */
  readonly data: readonly TransitData[];
}

/**
 * Renders high-level sustainability KPI tiles.
 *
 * @param props - Component properties.
 * @returns Semantic HTML article elements displaying aggregated stats.
 */
export function SustainabilityStats({ data }: SustainabilityStatsProps) {
  let totalEvs = 0;
  let totalWavs = 0;
  let totalRefills = 0;

  for (const hub of data) {
    totalEvs += hub.evShuttleCount;
    totalWavs += hub.wavAvailable;
    totalRefills += hub.waterRefillStations;
  }

  const avgCarbonOffset = Math.round(
    data.reduce((sum, hub) => sum + hub.carbonOffsetPct, 0) / (data.length || 1)
  );

  return (
    <section aria-labelledby="sustainability-title" className="w-full mt-8">
      <h2 id="sustainability-title" className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
        Sustainability & Accessibility
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <article className="p-6 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-400">Carbon Offset</h3>
          <p className="text-3xl font-bold text-green-900 dark:text-green-300 mt-2">{avgCarbonOffset}%</p>
        </article>

        <article className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">Active EV Shuttles</h3>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-300 mt-2">{totalEvs}</p>
        </article>

        <article className="p-6 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/30 rounded-xl">
          <h3 className="text-sm font-medium text-purple-800 dark:text-purple-400">Accessible (WAV) Vehicles</h3>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-300 mt-2">{totalWavs}</p>
        </article>

        <article className="p-6 bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200 dark:border-cyan-900/30 rounded-xl">
          <h3 className="text-sm font-medium text-cyan-800 dark:text-cyan-400">Water Refill Stations</h3>
          <p className="text-3xl font-bold text-cyan-900 dark:text-cyan-300 mt-2">{totalRefills}</p>
        </article>

      </div>
    </section>
  );
}
