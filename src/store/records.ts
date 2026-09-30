import type { CubeStateV1 } from '../cube/engine';
export const trainers = ['cross', 'cross1', 'f2l', 'oll', 'pll', 'zbll', 'cross2'] as const;
export type Trainer = typeof trainers[number];
export const colors = ['white', 'yellow', 'green', 'blue', 'red', 'orange'] as const;
export type Color = typeof colors[number];
export type Slot = 'FR' | 'FL' | 'BR' | 'BL';
export type Face = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';
export type CrossDepth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export interface Move { family: Face | 'Uw' | 'Rw' | 'Fw' | 'Dw' | 'Lw' | 'Bw' | 'M' | 'E' | 'S' | 'x' | 'y' | 'z'; amount: 1 | 2 | -1 }
export type GoalOptions =
  | { trainer: 'cross'; K: CrossDepth }
  | { trainer: 'cross1'; K: CrossDepth; L: number; pair: { kind: 'any' } | { kind: 'slot'; slot: Slot } }
  | { trainer: 'cross2'; K: CrossDepth; L: number }
  | { trainer: 'f2l'; caseId: string; slot: Slot; hint: boolean; mode: 'execution' | 'recognition' }
  | { trainer: 'oll' | 'pll' | 'zbll'; caseId: string; preAuf: 0 | 1 | 2 | 3; yaw: 0 | 1 | 2 | 3; mode: 'execution' | 'recognition' };
export interface Versions { contract: 1; engine: string; dataset: string | null; tables: string }
export interface TrainingFrame { colorOfFace: Readonly<Record<Face, Color>>; crossColor: Color }
export type Proof =
  | { kind: 'cross-optimal'; depth: CrossDepth; solution: Move[] }
  | { kind: 'combined-bound'; crossDepth: number; cap: number; witness: Move[]; solvedSlots: Slot[] }
  | { kind: 'case'; caseId: string; identityKey: string; setup: Move[]; solution: Move[]; finalAuf: 0 | 1 | 2 | 3; representative: boolean };
interface ChallengeCommon {
  challengeId: string; requestId: string; epoch: number; versions: Versions;
  frame: TrainingFrame; scramble: Move[]; start: CubeStateV1;
}
export type Challenge = ChallengeCommon & (
  | { options: Extract<GoalOptions, { trainer: 'cross' }>; proof: Extract<Proof, { kind: 'cross-optimal' }> }
  | { options: Extract<GoalOptions, { trainer: 'cross1' | 'cross2' }>; proof: Extract<Proof, { kind: 'combined-bound' }> }
  | { options: Extract<GoalOptions, { trainer: 'f2l' | 'oll' | 'pll' | 'zbll' }>; proof: Extract<Proof, { kind: 'case' }> }
);
export interface SettingsRecord {
  key: 'preferences'; theme: 'dark' | 'light' | 'system'; defaultTrainer: Trainer; crossColor: Color;
  inspectionMode: 'untimed' | '15s'; audibleWarnings: boolean; reducedMotion: 'system' | 'on';
  lastOptions: Partial<Record<Trainer, GoalOptions>>;
}
export const defaultSettings: SettingsRecord = {
  key: 'preferences', theme: 'dark', defaultTrainer: 'cross', crossColor: 'white', inspectionMode: 'untimed',
  audibleWarnings: false, reducedMotion: 'system', lastOptions: {},
};
export interface SessionRecord { id: string; trainer: Trainer; label: string; createdAt: string }
export type Timing =
  | { status: 'completed'; executionMs: number; inspectionMs: number | null }
  | { status: 'interrupted'; executionMs: number | null; inspectionMs: number | null;
      phase: 'preparation' | 'inspection' | 'arming' | 'execution'; reason: 'background' | 'restart' | 'cancelled' };
export type TimingSettings = Pick<SettingsRecord, 'inspectionMode' | 'audibleWarnings'>;
export interface AttemptRecord {
  settingsSnapshot: TimingSettings;
  id: string; sessionId: string; trainer: Trainer; challenge: Challenge; presentedAt: string; endedAt: string;
  preparationMs: number; timing: Timing; penalty: { kind: 'none' | 'plus2' | 'dnf'; source: 'inspection' | 'manual' | 'none' };
  runId?: string; repIndex?: number; selfReport?: { executedSlots: Slot[] };
  review?: { moves: Move[]; preAuf: 0 | 1 | 2 | 3; validatedDatasetVersion: string; validatedEngineVersion: string };
}
export interface PersonalAlgorithmRecord {
  caseId: string; slot: 'canonical' | Slot; moves: Move[]; preAuf: 0 | 1 | 2 | 3; updatedAt: string;
  identityPolicyVersion: string; identityKey: string; validatedDatasetVersion: string; validatedEngineVersion: string;
}
export interface PracticeSetRecord {
  id: string; label: string; trainer: 'oll' | 'pll' | 'zbll'; caseIds: string[]; createdAt: string; updatedAt: string;
}
export type RepOutcome = { kind: 'attempt'; repIndex: number; attemptId: string }
  | { kind: 'skipped'; repIndex: number; caseId: string }
  | { kind: 'interrupted'; repIndex: number; attemptId: string | null };
export interface RunRecord {
  id: string; sessionId: string; setId: string | null;
  setSnapshot: PracticeSetRecord; comparisonKey: string;
  repPlan: { caseId: string; preAuf: 0 | 1 | 2 | 3; yaw: 0 | 1 | 2 | 3 }[];
  status: 'active' | 'complete' | 'interrupted' | 'abandoned'; cursor: number; outcomes: RepOutcome[];
  createdAt: string; endedAt: string | null;
}
export interface TrainerBackupV1 {
  format: 'cube-trainer-backup'; version: 1; exportedAt: string; cubeContract: 'cube3-facelets-v1';
  settings: SettingsRecord[]; sessions: SessionRecord[]; attempts: AttemptRecord[];
  personalAlgorithms: PersonalAlgorithmRecord[]; practiceSets: PracticeSetRecord[]; runs: RunRecord[];
}
export const personalStores = ['settings', 'sessions', 'attempts', 'personalAlgorithms', 'practiceSets', 'runs'] as const;
export interface SemanticValidator {
  validateAttempt(record: unknown): Promise<AttemptRecord>;
  validateTrainingData(data: { personalAlgorithms: unknown[]; practiceSets: unknown[]; runs: unknown[] }, attempts: AttemptRecord[], sessions: SessionRecord[]): Promise<Pick<TrainerBackupV1, 'personalAlgorithms' | 'practiceSets' | 'runs'>>;
}
