import { clampDelta, createSeededRandom } from '../core/random';

export type ResidentAction = 'walk' | 'talk' | 'work' | 'shelter' | 'idle';
export type WeatherState = 'clear' | 'cloudy' | 'rain' | 'storm' | 'fog';

export interface ResidentState {
  id: string;
  name: string;
  seed: number;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  action: ResidentAction;
  decisionIn: number;
  mood: 'calm' | 'cheerful' | 'focused' | 'concerned';
}

export function createResident(id: string, name: string, seed: number): ResidentState {
  const random = createSeededRandom(seed);
  const x = (random() - 0.5) * 12;
  const z = (random() - 0.5) * 12;
  return {
    id, name, seed, x, z,
    targetX: (random() - 0.5) * 14,
    targetZ: (random() - 0.5) * 14,
    action: 'walk',
    decisionIn: 2 + random() * 3,
    mood: 'calm',
  };
}

export function advanceResident(
  resident: ResidentState,
  deltaSeconds: number,
  weather: WeatherState,
  hour: number,
): ResidentState {
  const delta = clampDelta(deltaSeconds, 1);
  let next = { ...resident, decisionIn: resident.decisionIn - delta };

  if (next.decisionIn <= 0) {
    const random = createSeededRandom(next.seed + Math.floor(hour * 10) + Math.floor(next.x * 100));
    const action: ResidentAction = weather === 'storm' || weather === 'rain'
      ? 'shelter'
      : hour >= 9 && hour < 17 && random() > 0.3
        ? 'work'
        : random() > 0.5 ? 'talk' : 'walk';
    next = {
      ...next,
      action,
      mood: weather === 'storm' ? 'concerned' : action === 'work' ? 'focused' : 'cheerful',
      decisionIn: 3 + random() * 4,
    };
  }

  if (next.action === 'shelter' || next.action === 'work' || next.action === 'idle') return next;

  const dx = next.targetX - next.x;
  const dz = next.targetZ - next.z;
  const distance = Math.hypot(dx, dz);
  if (distance < 0.12) {
    const random = createSeededRandom(next.seed + Math.floor(next.decisionIn * 1000));
    return {
      ...next,
      targetX: (random() - 0.5) * 18,
      targetZ: (random() - 0.5) * 18,
      action: 'idle',
      decisionIn: 1.5,
    };
  }

  const step = Math.min(distance, delta * 1.5);
  return {
    ...next,
    x: next.x + (dx / distance) * step,
    z: next.z + (dz / distance) * step,
  };
}