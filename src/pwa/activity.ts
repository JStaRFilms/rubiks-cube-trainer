import { createStore } from 'zustand/vanilla';
export type Activity = 'idle' | 'preparation' | 'inspection' | 'arming' | 'execution' | 'save-pending' | 'save-failed' | 'editing';
export const activityStore = createStore<{ phase: Activity; updateToken: string | null }>(() => ({ phase: 'idle', updateToken: null }));
// Timer and editing controllers must enter through this gate, including deferred starts.
export function enterActivity(phase: Activity): boolean {
  if (activityStore.getState().updateToken) return false;
  activityStore.setState({ phase }); return true;
}
export function lockUpdate(token: string): boolean {
  const state = activityStore.getState();
  if (state.phase !== 'idle' || (state.updateToken && state.updateToken !== token)) return false;
  activityStore.setState({ updateToken: token }); return true;
}
export function releaseUpdate(token: string): void {
  if (activityStore.getState().updateToken === token) activityStore.setState({ updateToken: null });
}
