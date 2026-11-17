export interface UtilityAction {
  id: string;
  score: number;
  eligible: boolean;
  priority: number;
}

export function chooseUtilityAction<T extends UtilityAction>(actions: readonly T[]): T | null {
  return actions
    .filter((action) => action.eligible && Number.isFinite(action.score) && action.score > 0)
    .slice()
    .sort((a, b) => b.score - a.score || b.priority - a.priority || a.id.localeCompare(b.id))[0] ?? null;
}