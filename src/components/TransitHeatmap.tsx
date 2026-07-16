import type { TransitData } from '@/lib/domain/schemas';

/** Props for the TransitHeatmap component. */
interface TransitHeatmapProps {
  /** Array of transit hub data to visualize. */
  readonly data: readonly TransitData[];
}

/**
 * Renders a raw SVG heatmap of transit hub occupancy.
 * Uses zero client-side JavaScript (React Server Component).
 * Includes a visually hidden table for screen readers.
 *
 * @param props - Component properties.
 * @returns The SVG and semantic table accessible UI.
 */
export function TransitHeatmap({ data }: TransitHeatmapProps) {
  const maxCapacity = Math.max(...data.map((d) => d.capacity));

  return (
    <section aria-labelledby="heatmap-title" className="w-full">
      <h2 id="heatmap-title" className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
        Live Transit Load
      </h2>

      {/* Visually hidden semantic table for screen readers (WCAG 1.3.1) */}
      <div className="sr-only">
        <table>
          <caption>Current occupancy levels for all transit hubs</caption>
          <thead>
            <tr>
              <th scope="col">Hub Name</th>
              <th scope="col">Crowd Level</th>
              <th scope="col">Capacity</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((hub) => (
              <tr key={hub.hubId}>
                <td>{hub.hubName}</td>
                <td>{hub.crowdLevel}</td>
                <td>{hub.capacity}</td>
                <td>{hub.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Raw SVG visualization (Zero external dependencies) */}
      <svg
        role="img"
        aria-label="Bar chart showing live occupancy across all transit hubs"
        className="w-full h-64 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50"
        viewBox={`0 0 800 ${Math.max(300, data.length * 50)}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {data.map((hub, index) => {
          const ratio = hub.crowdLevel / hub.capacity;
          const barWidth = Math.max(10, (hub.crowdLevel / maxCapacity) * 500);
          const yPos = index * 50 + 25;
          const isCritical = ratio >= 0.85;

          return (
            <g key={hub.hubId}>
              <text
                x="150"
                y={yPos + 5}
                textAnchor="end"
                className="text-sm fill-zinc-600 dark:fill-zinc-400 font-medium"
              >
                {hub.hubName}
              </text>
              <rect
                x="170"
                y={yPos - 10}
                width={barWidth}
                height="20"
                className={`transition-all ${
                  isCritical
                    ? 'fill-red-500 dark:fill-red-600'
                    : 'fill-blue-500 dark:fill-blue-600'
                }`}
                rx="4"
              />
              <text
                x={170 + barWidth + 10}
                y={yPos + 5}
                className="text-xs fill-zinc-500 dark:fill-zinc-400"
              >
                {Math.round(ratio * 100)}% ({hub.status})
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
