import { clampDelta } from './random';

export interface SimulationClock {
  day: number;
  secondsOfDay: number;
}

export function createClock(secondsOfDay = 8 * 60 * 60, day = 1): SimulationClock {
  const total = Number.isFinite(secondsOfDay) ? Math.max(0, secondsOfDay) : 0;
  return {
    day: Math.max(1, Math.floor(day)),
    secondsOfDay: total % 86_400,
  };
}

export function advanceClock(
  clock: SimulationClock,
  frameDeltaSeconds: number,
  timeScale = 60,
  maxFrameDelta = 0.1,
): SimulationClock {
  if (!Number.isFinite(timeScale) || timeScale <= 0) return clock;
  const elapsed = clampDelta(frameDeltaSeconds, maxFrameDelta) * timeScale;
  if (elapsed === 0) return clock;

  const total = clock.secondsOfDay + elapsed;
  const dayOffset = Math.floor(total / 86_400);
  return {
    day: clock.day + dayOffset,
    secondsOfDay: total % 86_400,
  };
}

export function formatWorldTime(clock: SimulationClock): string {
  const hours = Math.floor(clock.secondsOfDay / 3600);
  const minutes = Math.floor((clock.secondsOfDay % 3600) / 60);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
}