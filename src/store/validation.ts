import { colors, trainers, type GoalOptions, type SemanticValidator, type SessionRecord, type SettingsRecord, type Trainer, type TrainerBackupV1 } from './records';
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export class DataError extends Error {}
export function object(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new DataError('Expected an object. Local data is unchanged.');
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, required: string[], optional: string[] = []) {
  if (required.some((key) => !(key in value)) || Object.keys(value).some((key) => ![...required, ...optional].includes(key))) throw new DataError('Missing or unknown fields. Local data is unchanged.');
}
export function text(value: unknown, label = 'Text'): string {
  if (typeof value !== 'string' || !value.trim() || value.length > 65536) throw new DataError(`${label} must be nonempty and at most 64 KiB.`);
  return value;
}
export function date(value: unknown): string {
  const result = text(value, 'Date');
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(result) || !Number.isFinite(Date.parse(result)) || new Date(result).toISOString() !== result) throw new DataError('Dates must be valid UTC ISO timestamps.');
  return result;
}
function choice<T extends string>(value: unknown, choices: readonly T[]): T {
  if (typeof value !== 'string' || !choices.includes(value as T)) throw new DataError(`Expected one of: ${choices.join(', ')}.`);
  return value as T;
}
function bool(value: unknown): boolean {
  if (typeof value !== 'boolean') throw new DataError('Expected true or false.');
  return value;
}
export function integer(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) throw new DataError(`Expected an integer between ${min} and ${max}.`);
  return value;
}
const slots = ['FR', 'FL', 'BR', 'BL'] as const;
export function decodeGoalOptions(input: unknown): GoalOptions {
  const v = object(input);
  const trainer = choice(v.trainer, trainers);
  if (trainer === 'cross' || trainer === 'cross1' || trainer === 'cross2') {
    const K = integer(v.K, 1, 8) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    if (trainer === 'cross') { keys(v, ['trainer', 'K']); return { trainer, K }; }
    const L = integer(v.L, 1);
    if (trainer === 'cross2') { keys(v, ['trainer', 'K', 'L']); return { trainer, K, L }; }
    keys(v, ['trainer', 'K', 'L', 'pair']);
    const pair = object(v.pair);
    if (pair.kind === 'any') { keys(pair, ['kind']); return { trainer, K, L, pair: { kind: 'any' } }; }
    keys(pair, ['kind', 'slot']);
    choice(pair.kind, ['slot']);
    return { trainer, K, L, pair: { kind: 'slot', slot: choice(pair.slot, slots) } };
  }
  const caseId = text(v.caseId), mode = choice(v.mode, ['execution', 'recognition']);
  if (trainer === 'f2l') {
    keys(v, ['trainer', 'caseId', 'slot', 'hint', 'mode']);
    return { trainer, caseId, mode, slot: choice(v.slot, slots), hint: bool(v.hint) };
  }
  keys(v, ['trainer', 'caseId', 'preAuf', 'yaw', 'mode']);
  return { trainer, caseId, mode, preAuf: integer(v.preAuf, 0, 3) as 0 | 1 | 2 | 3, yaw: integer(v.yaw, 0, 3) as 0 | 1 | 2 | 3 };
}
export function decodeSettings(input: unknown): SettingsRecord {
  const v = object(input);
  keys(v, ['key', 'theme', 'defaultTrainer', 'crossColor', 'inspectionMode', 'audibleWarnings', 'reducedMotion', 'lastOptions']);
  const lastOptions: Partial<Record<Trainer, GoalOptions>> = {};
  for (const [key, value] of Object.entries(object(v.lastOptions))) {
    const trainer = choice(key, trainers), option = decodeGoalOptions(value);
    if (trainer !== option.trainer) throw new DataError('Trainer options do not match their key.');
    lastOptions[trainer] = option;
  }
  return { key: choice(v.key, ['preferences']), theme: choice(v.theme, ['dark', 'light', 'system']),
    defaultTrainer: choice(v.defaultTrainer, trainers), crossColor: choice(v.crossColor, colors),
    inspectionMode: choice(v.inspectionMode, ['untimed', '15s']), audibleWarnings: bool(v.audibleWarnings),
    reducedMotion: choice(v.reducedMotion, ['system', 'on']), lastOptions };
}
export function decodeSession(input: unknown): SessionRecord {
  const v = object(input); keys(v, ['id', 'trainer', 'label', 'createdAt']);
  return { id: text(v.id, 'Session ID'), trainer: choice(v.trainer, trainers), label: text(v.label, 'Session label'), createdAt: date(v.createdAt) };
}
function array(input: unknown): unknown[] {
  if (!Array.isArray(input) || input.length > 100000) throw new DataError('Each record group must be an array with at most 100,000 records.');
  return input;
}
export function boundedInput(input: unknown, depth = 0): void {
  if (depth > 32) throw new DataError('The file is nested too deeply.');
  if (typeof input === 'string' && input.length > 65536) throw new DataError('A string exceeds the 64 KiB limit.');
  if (Array.isArray(input)) {
    if (input.length > 100000) throw new DataError('An array exceeds 100,000 entries.');
    for (const item of input) boundedInput(item, depth + 1);
  } else if (typeof input === 'object' && input !== null) for (const [key, value] of Object.entries(input)) {
    if (['moves', 'scramble', 'solution', 'witness', 'setup'].includes(key) && Array.isArray(value) && value.length > 10000) throw new DataError('A move list exceeds 10,000 moves.');
    boundedInput(value, depth + 1);
  }
}
function unique(values: string[]) {
  if (new Set(values).size !== values.length) throw new DataError('Duplicate record IDs. Local data is unchanged.');
}
export async function decodeBackup(input: unknown, validator?: SemanticValidator): Promise<TrainerBackupV1> {
  boundedInput(input);
  const v = object(input);
  if (v.format !== 'cube-trainer-backup') throw new DataError('This is not a Cube Trainer backup.');
  if (v.version !== 1) throw new DataError('Unsupported backup version. Use the app version that created this file.');
  keys(v, ['format', 'version', 'exportedAt', 'cubeContract', 'settings', 'sessions', 'attempts', 'personalAlgorithms', 'practiceSets', 'runs']);
  if (v.cubeContract !== 'cube3-facelets-v1') throw new DataError('Unsupported cube contract.');
  const settings = array(v.settings).map(decodeSettings), sessions = array(v.sessions).map(decodeSession);
  if (settings.length > 1) throw new DataError('Only one preferences record is supported.');
  unique(sessions.map((s) => s.id));
  const attemptsInput = array(v.attempts);
  const future = { personalAlgorithms: array(v.personalAlgorithms), practiceSets: array(v.practiceSets), runs: array(v.runs) };
  if ((attemptsInput.length || Object.values(future).some((a) => a.length)) && !validator) throw new DataError('This backup needs a compatible cube engine/dataset validator. No records were replaced. Training records are not supported in this foundation release.');
  const attempts = validator ? await Promise.all(attemptsInput.map((a) => validator.validateAttempt(a))) : [];
  unique(attempts.map((a) => a.id));
  for (const attempt of attempts) {
    const session = sessions.find((s) => s.id === attempt.sessionId);
    if (!session || session.trainer !== attempt.trainer || attempt.challenge.options.trainer !== attempt.trainer) throw new DataError('Attempt/session/trainer references do not match.');
    validateAttemptDurations(attempt);
  }
  const training = validator ? await validator.validateTrainingData(future, attempts, sessions) : { personalAlgorithms: [], practiceSets: [], runs: [] };
  return { format: 'cube-trainer-backup', version: 1, cubeContract: 'cube3-facelets-v1', exportedAt: date(v.exportedAt), settings, sessions, attempts, ...training };
}
export function validateAttemptDurations(input: unknown): void {
  const v = object(input), timing = object(v.timing), penalty = object(v.penalty);
  text(v.id); text(v.sessionId); integer(v.preparationMs); date(v.presentedAt); date(v.endedAt);
  if (Date.parse(String(v.endedAt)) < Date.parse(String(v.presentedAt))) throw new DataError('Attempt ends before presentation.');
  choice(timing.status, ['completed', 'interrupted']);
  if (timing.executionMs !== null || timing.status === 'completed') integer(timing.executionMs);
  if (timing.inspectionMs !== null) integer(timing.inspectionMs);
  if (timing.status === 'interrupted') { choice(timing.phase, ['preparation', 'inspection', 'arming', 'execution']); choice(timing.reason, ['background', 'restart', 'cancelled']); }
  const kind = choice(penalty.kind, ['none', 'plus2', 'dnf']), source = choice(penalty.source, ['inspection', 'manual', 'none']);
  if ((kind === 'none') !== (source === 'none') || (source === 'inspection' && timing.inspectionMs === null)) throw new DataError('Penalty and inspection metadata do not match.');
}
export async function parseBackup(textInput: string, validator?: SemanticValidator): Promise<TrainerBackupV1> {
  if (new TextEncoder().encode(textInput).byteLength > MAX_FILE_BYTES) throw new DataError('Backup exceeds 20 MiB. Choose a smaller backup.');
  let value: unknown;
  try { value = JSON.parse(textInput); } catch { throw new DataError('The file is not valid JSON. Local data is unchanged.'); }
  return decodeBackup(value, validator);
}
