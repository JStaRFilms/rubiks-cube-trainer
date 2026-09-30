import { activityStore, enterActivity, type Activity } from '../pwa/activity';
import type { AttemptRecord, Challenge, RunRecord, SessionRecord, TimingSettings } from '../store/records';
import { storageMessage } from '../store/repository';

export interface Presentation {
  challenge: Challenge;
  session: SessionRecord;
  settings: TimingSettings;
  // Set trainers supply the frozen run update for this exact stopped rep.
  run?: { id: string; repIndex: number; outcome: (attempt: AttemptRecord) => RunRecord };
}
export interface TimerPersistence { saveAttempt(attempt: AttemptRecord, run?: RunRecord): Promise<void> }
export type TimerPhase = 'idle' | 'preparation' | 'inspection' | 'arming' | 'execution' | 'save-pending' | 'saved' | 'save-failed';
export interface TimerState {
  phase: TimerPhase;
  armed: boolean;
  warning: 0 | 8 | 12;
  record: AttemptRecord | null;
  error: string;
}
export interface TimerClock { now(): number; date(): string; id(): string }
const browserClock: TimerClock = { now: () => performance.now(), date: () => new Date().toISOString(), id: () => crypto.randomUUID() };
export function freezeSnapshot<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value)) freezeSnapshot(child);
    Object.freeze(value);
  }
  return value;
}
const activePhases = new Set<TimerPhase>(['preparation', 'inspection', 'arming', 'execution']);
export class TimerController {
  private state: TimerState = { phase: 'idle', armed: false, warning: 0, record: null, error: '' };
  private listeners = new Set<() => void>();
  private presentation: Presentation | null = null;
  private presented = 0;
  private presentedAt = '';
  private inspection: number | null = null;
  private execution: number | null = null;
  private hold: number | null = null;
  private owner: string | null = null;
  private returnPhase: 'preparation' | 'inspection' = 'preparation';
  private stopped = -Infinity;
  private penalty: AttemptRecord['penalty'] = { kind: 'none', source: 'none' };
  private preparationMs = 0;
  private inspectionMs: number | null = null;
  private pendingRun: RunRecord | undefined;
  constructor(private readonly persistence: TimerPersistence, private readonly clock: TimerClock = browserClock,
    private readonly activity: (phase: Activity) => boolean = (phase) => activityStore.getState().phase !== 'editing' && enterActivity(phase),
    private readonly warn: (second: 8 | 12) => void = () => {}) {}
  getSnapshot = (): TimerState => this.state;
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  get active(): boolean { return activePhases.has(this.state.phase); }
  get blocked(): boolean { return this.active || this.state.phase === 'save-pending' || this.state.phase === 'save-failed'; }
  get canPresent(): boolean { return !this.blocked && this.clock.now() - this.stopped >= 250; }
  private publish(change: Partial<TimerState>): void {
    this.state = { ...this.state, ...change }; for (const listener of this.listeners) listener();
  }
  private phase(phase: TimerPhase, change: Partial<TimerState> = {}): boolean {
    if (!this.activity(phase === 'saved' ? 'idle' : phase)) return false;
    this.publish({ phase, ...change }); return true;
  }
  // Call only after the scramble is committed, never when a worker request starts.
  present(input: Presentation): boolean {
    if (this.blocked || this.clock.now() - this.stopped < 250) return false;
    if (input.challenge.options.trainer !== input.session.trainer) throw new Error('Challenge and session trainer must match.');
    if (!this.activity('preparation')) return false;
    this.presentation = { ...input, challenge: freezeSnapshot(structuredClone(input.challenge)),
      session: freezeSnapshot(structuredClone(input.session)), settings: freezeSnapshot(structuredClone(input.settings)),
      run: input.run ? Object.freeze({ ...input.run }) : undefined };
    this.presented = this.clock.now(); this.presentedAt = this.clock.date();
    this.inspection = null; this.execution = null; this.owner = null; this.hold = null;
    this.preparationMs = 0; this.inspectionMs = null; this.pendingRun = undefined;
    this.penalty = { kind: 'none', source: 'none' };
    this.publish({ phase: 'preparation', armed: false, warning: 0, record: null, error: '' }); return true;
  }
  press(owner: string): boolean {
    if (!this.active || this.owner !== null || this.clock.now() - this.stopped < 250) return false;
    this.owner = owner;
    if (this.state.phase === 'execution') { this.finish(); return true; }
    if (this.state.phase === 'preparation' && this.presentation?.settings.inspectionMode === '15s') {
      this.inspection = this.clock.now(); this.phase('inspection'); return true;
    }
    if (this.state.phase === 'preparation' || this.state.phase === 'inspection') {
      this.returnPhase = this.state.phase; this.hold = this.clock.now(); this.phase('arming', { armed: false }); return true;
    }
    return false;
  }
  release(owner: string): void {
    if (owner !== this.owner) return;
    this.owner = null;
    if (this.state.phase !== 'arming' || this.hold === null) return;
    const now = this.clock.now();
    if (now - this.hold < 300) { this.hold = null; this.phase(this.returnPhase, { armed: false }); return; }
    this.tick();
    const inspection = this.inspection === null ? null : now - this.inspection;
    const kind = inspection !== null && inspection >= 17000 ? 'dnf' : inspection !== null && inspection >= 15000 ? 'plus2' : 'none';
    this.penalty = { kind, source: kind === 'none' ? 'none' : 'inspection' };
    this.inspectionMs = inspection === null ? null : Math.round(inspection);
    this.preparationMs = Math.round(now - this.presented);
    if (this.phase('execution', { armed: false })) { this.execution = now; this.hold = null; }
  }
  // Enter and assistive/native click perform discrete actions, never hold-to-start.
  action(): void {
    if (this.owner !== null || !this.active) return;
    if (this.state.phase === 'execution' || (this.state.phase === 'preparation' && this.presentation?.settings.inspectionMode === '15s')) {
      if (this.press('action')) this.release('action');
    }
  }
  cancelInput(owner?: string): void {
    if (owner !== undefined && owner !== this.owner) return;
    this.owner = null; this.hold = null;
    if (this.state.phase === 'arming') this.phase(this.returnPhase, { armed: false });
  }
  tick(): void {
    if (this.state.phase === 'arming' && this.hold !== null && !this.state.armed && this.clock.now() - this.hold >= 300) this.publish({ armed: true });
    if ((this.state.phase === 'inspection' || this.state.phase === 'arming') && this.inspection !== null) {
      const elapsed = this.clock.now() - this.inspection;
      for (const second of [8, 12] as const) if (elapsed >= second * 1000 && this.state.warning < second) {
        this.publish({ warning: second }); this.warn(second);
      }
    }
  }
  elapsed(): { execution: number; inspection: number } {
    const now = this.clock.now();
    return { execution: this.execution === null ? 0 : now - this.execution, inspection: this.inspection === null ? 0 : now - this.inspection };
  }
  interrupt(reason: 'background' | 'cancelled' = 'background'): void {
    if (!this.active) return;
    this.finish(reason);
  }
  private finish(reason?: 'background' | 'cancelled'): void {
    const presentation = this.presentation;
    if (!presentation || !this.active) return;
    const now = this.clock.now(), phase = this.state.phase;
    const record: AttemptRecord = {
      id: this.clock.id(), sessionId: presentation.session.id, trainer: presentation.session.trainer,
      settingsSnapshot: presentation.settings, challenge: presentation.challenge,
      presentedAt: this.presentedAt, endedAt: this.clock.date(),
      preparationMs: this.execution === null ? Math.round(now - this.presented) : this.preparationMs,
      timing: reason ? { status: 'interrupted', executionMs: this.execution === null ? null : Math.round(now - this.execution),
        inspectionMs: this.execution === null ? (this.inspection === null ? null : Math.round(now - this.inspection)) : this.inspectionMs,
        phase: phase === 'preparation' || phase === 'inspection' || phase === 'arming' ? phase : 'execution', reason }
        : { status: 'completed', executionMs: Math.round(now - (this.execution ?? now)), inspectionMs: this.inspectionMs },
      penalty: this.penalty,
      ...(presentation.run ? { runId: presentation.run.id, repIndex: presentation.run.repIndex } : {}),
    };
    this.stopped = now; this.cancelInput();
    this.publish({ record: freezeSnapshot(record), armed: false });
    void this.save();
  }
  async retry(): Promise<void> { if (this.state.phase === 'save-failed') await this.save(); }
  private async save(): Promise<void> {
    const record = this.state.record;
    if (!record || !this.phase('save-pending', { error: '' })) return;
    try {
      if (this.presentation?.run && !this.pendingRun) this.pendingRun = freezeSnapshot(structuredClone(this.presentation.run.outcome(record)));
      await this.persistence.saveAttempt(record, this.pendingRun); this.phase('saved');
    }
    catch (error) { this.phase('save-failed', { error: storageMessage(error) }); }
  }
  // Explicit loss acknowledgement is required. Saving cannot be discarded mid-write.
  discardUnsaved(): boolean {
    if (this.state.phase !== 'save-failed') return false;
    this.presentation = null; this.publish({ record: null }); return this.phase('idle', { error: '' });
  }
}

export function emergencyExport(record: AttemptRecord) {
  return { format: 'cube-trainer-unsaved-attempt', version: 1, unsaved: true, exportedAt: new Date().toISOString(), attempt: record } as const;
}
