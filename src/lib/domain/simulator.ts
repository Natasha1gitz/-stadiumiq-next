/**
 * Deterministic transit hub data simulator using seeded math.
 * Generates reproducible crowd density, sustainability, and WAV metrics.
 * @module simulator
 */
import { type TransitData, TransitDataSchema } from './schemas';
import { type Result, ok, err } from './result';

/** Hub names for the simulated transit network. */
const HUB_NAMES: readonly string[] = [
  'MetLife North Hub',
  'SoFi West Transit',
  'NRG South Terminal',
  'Hard Rock East Gate',
  'AT&T Central Plaza',
  'Lumen Field Station',
] as const;

/**
 * Generates a seeded pseudo-random number between 0 and 1.
 * Uses a simple linear congruential generator for determinism.
 *
 * @param seed - The seed value for reproducible output.
 * @returns A number between 0 (inclusive) and 1 (exclusive).
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;

  return x - Math.floor(x);
}

/**
 * Derives a crowd status label from the occupancy ratio.
 *
 * @param ratio - The crowd-to-capacity ratio (0–1).
 * @returns One of 'comfortable', 'busy', or 'critical'.
 */
function deriveStatus(ratio: number): 'comfortable' | 'busy' | 'critical' {
  if (ratio >= 0.85) {
    return 'critical';
  }

  if (ratio >= 0.6) {
    return 'busy';
  }

  return 'comfortable';
}

/**
 * Generates deterministic TransitData for a single transit hub.
 *
 * @param hubId - Unique identifier of the transit hub.
 * @param seed - Deterministic seed for reproducible results.
 * @returns A Result containing TransitData on success, or an Error on invalid input.
 *
 * @example
 * ```ts
 * const result = generateTransitData('hub-north', 42);
 * if (result.ok) {
 *   console.log(result.value.crowdLevel);
 * }
 * ```
 */
export function generateTransitData(
  hubId: string,
  seed: number,
): Result<TransitData> {
  if (hubId.length === 0) {
    return err(new Error('Hub ID cannot be empty'));
  }

  if (seed < 0) {
    return err(new Error('Seed must be non-negative'));
  }

  const capacity = 500 + Math.floor(seededRandom(seed) * 500);
  const crowdLevel = Math.floor(seededRandom(seed + 1) * capacity);
  const ratio = crowdLevel / capacity;
  const hubIndex = Math.abs(hubId.charCodeAt(0)) % HUB_NAMES.length;

  const raw: TransitData = {
    hubId,
    hubName: HUB_NAMES[hubIndex]!,
    crowdLevel,
    capacity,
    wavAvailable: Math.floor(seededRandom(seed + 2) * 10),
    evShuttleCount: Math.floor(seededRandom(seed + 3) * 20),
    carbonOffsetPct: Math.round(seededRandom(seed + 4) * 100),
    waterRefillStations: Math.floor(seededRandom(seed + 5) * 8),
    status: deriveStatus(ratio),
  };

  const parsed = TransitDataSchema.safeParse(raw);

  if (!parsed.success) {
    return err(new Error(parsed.error.message));
  }

  return ok(parsed.data);
}

/**
 * Generates transit data for all hubs in the simulated network.
 *
 * @param seed - Base seed for deterministic generation.
 * @returns A Result containing an array of TransitData for all hubs.
 *
 * @example
 * ```ts
 * const result = generateAllHubs(42);
 * if (result.ok) {
 *   result.value.forEach(hub => console.log(hub.hubName));
 * }
 * ```
 */
export function generateAllHubs(seed: number): Result<TransitData[]> {
  if (seed < 0) {
    return err(new Error('Seed must be non-negative'));
  }

  const hubs: TransitData[] = [];

  for (let i = 0; i < HUB_NAMES.length; i++) {
    const hubResult = generateTransitData(`hub-${String(i)}`, seed + i * 10);

    if (!hubResult.ok) {
      return err(hubResult.error);
    }

    hubs.push(hubResult.value);
  }

  return ok(hubs);
}
