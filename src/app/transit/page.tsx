import { generateAllHubs } from '@/lib/domain/simulator';
import { TransitHeatmap } from '@/components/TransitHeatmap';
import { SustainabilityStats } from '@/components/SustainabilityStats';
import { AIDispatch } from '@/components/AIDispatch';

/**
 * Transit Command Dashboard.
 * Demonstrates Transportation, Sustainability, and Operational Intelligence via pure RSC.
 *
 * @returns The Next.js page component.
 */
export default function TransitDashboard() {
  // Generate deterministic mock data based on the current hour to simulate live updates
  const hourSeed = new Date().getHours();
  const dataResult = generateAllHubs(hourSeed);

  if (!dataResult.ok) {
    return (
      <main className="p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-red-600 mb-8">System Error</h1>
        <p role="alert">{dataResult.error.message}</p>
      </main>
    );
  }

  const hubs = dataResult.value;

  return (
    <main className="p-8 max-w-7xl mx-auto w-full font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Transit Command Dashboard
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Live monitoring of accessible vehicle routing, hub crowd loads, and sustainability metrics.
        </p>
      </header>

      <div className="space-y-12">
        <TransitHeatmap data={hubs} />
        <SustainabilityStats data={hubs} />
        <AIDispatch context={hubs} />
      </div>
    </main>
  );
}
