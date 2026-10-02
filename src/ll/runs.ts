import type { CubeEngine } from '../cube/engine';
import { invertMoves } from '../cube/notation';
import { decodeFrame, decodeVersions } from '../cube/validation';
import { auf, QUARTERS, type QuarterTurn } from '../cases/identity';
import { validateGuidance } from '../cases/validation';
import { validateOverrideImport } from '../cases/overrides';
import { F2L_CASES } from '../data/f2l';
import type { AttemptRecord, LLRunSnapshot, PersonalAlgorithmRecord, PracticeSetRecord, RunRecord, SemanticValidator, SessionRecord, TimingSettings, TrainingFrame } from '../store/records';
import { boundedInput, date, integer, text } from '../store/validation';
import { createLL, LL_CASES, llEntry, llLibrary, LL_VERSIONS, presentLLGuidance, yawGuidance, type LLChallenge, type LLTrainer } from './model';
import { exact, moves, validateLL } from './validation';
function array(value: unknown): unknown[] { if (!Array.isArray(value) || value.length > 100000) throw Error('Expected bounded record list.'); return value; }
function quarter(value: unknown): QuarterTurn { const angle = QUARTERS.find((angle) => angle === value); if (angle === undefined) throw Error('Invalid last-layer angle.'); return angle; }
function policy(value: unknown): QuarterTurn | 'random' { return value === 'random' ? 'random' : quarter(value); }
function same(a: unknown, b: unknown): boolean { return JSON.stringify(a) === JSON.stringify(b); }
function unique(values: readonly unknown[]): void { if (new Set(values).size !== values.length) throw Error('Duplicate set/run references.'); }
export type LLRunRecord = RunRecord & { setSnapshot: PracticeSetRecord & { trainer: LLTrainer }; snapshot: LLRunSnapshot & { challenges: LLChallenge[] }; presented: boolean; interruptions: number[] };
export function validateSet(input: unknown): PracticeSetRecord & { trainer: LLTrainer } {
  const value = exact(input, ['id', 'label', 'trainer', 'caseIds', 'createdAt', 'updatedAt']);
  if (value.trainer !== 'oll' && value.trainer !== 'pll') throw Error('Unsupported practice set trainer.');
  const caseIds = array(value.caseIds).map((id) => llEntry(value.trainer === 'oll' ? 'oll' : 'pll', text(id)).id);
  if (!caseIds.length || caseIds.length > llLibrary(value.trainer).length) throw Error('Select a nonempty last-layer subset.'); unique(caseIds);
  const createdAt = date(value.createdAt), updatedAt = date(value.updatedAt);
  if (updatedAt < createdAt) throw Error('Set update precedes creation.');
  return { id: text(value.id), label: text(value.label), trainer: value.trainer, caseIds, createdAt, updatedAt };
}
export function runComparisonKey(run: RunRecord): string {
  const snapshot = run.snapshot; if (!snapshot) throw Error('Missing frozen run snapshot.');
  const f = snapshot.frame, v = snapshot.versions;
  return JSON.stringify(['ll-run-v1', run.setSnapshot.trainer, [...run.setSnapshot.caseIds].sort(), snapshot.mode, snapshot.shuffle, snapshot.preAuf, snapshot.yaw,
    snapshot.settings.inspectionMode, [f.crossColor, f.colorOfFace.U, f.colorOfFace.R, f.colorOfFace.F, f.colorOfFace.D, f.colorOfFace.L, f.colorOfFace.B],
    [v.contract, v.engine, v.dataset, v.tables], [...snapshot.guidance].sort((a, b) => a.caseId.localeCompare(b.caseId)).map((g) => [g.caseId, llEntry(run.setSnapshot.trainer === 'oll' ? 'oll' : 'pll', g.caseId).identityPolicyVersion, g.preAuf, g.moves.map((m) => [m.family, m.amount]), g.finalAuf]), 'all-reps-no-dnf-skip-interruption-v1']);
}
export interface RunOptions { mode: 'execution' | 'recognition'; shuffle: boolean; preAuf: QuarterTurn | 'random'; yaw: QuarterTurn | 'random'; settings: TimingSettings; frame: TrainingFrame }
function randomIndex(length: number): number {
  const value = crypto.getRandomValues(new Uint32Array(1))[0]; if (value === undefined) throw Error('Random selection unavailable.'); return Math.floor(value / 0x100000000 * length);
}
export function createRun(engine: CubeEngine, set: PracticeSetRecord, session: SessionRecord, options: RunOptions, algorithms: readonly PersonalAlgorithmRecord[], setId: string | null = null): LLRunRecord {
  const selected = validateSet(set); if (session.trainer !== selected.trainer) throw Error('Run session trainer mismatch.');
  const trainer: LLTrainer = selected.trainer === 'oll' ? 'oll' : 'pll', valid = validateOverrideImport(engine, [...F2L_CASES, ...LL_CASES], algorithms);
  const id = crypto.randomUUID(), createdAt = new Date().toISOString(), order = [...selected.caseIds];
  if (options.shuffle) for (let i = order.length - 1; i > 0; i--) { const j = randomIndex(i + 1), a = order[i], b = order[j]; if (!a || !b) throw Error('Missing run member.'); order[i] = b; order[j] = a; }
  const guidance = selected.caseIds.map((caseId) => {
    const entry = llEntry(trainer, caseId), override = valid.find((record) => record.caseId === caseId);
    const moves = override ? override.moves : [...entry.defaultAlgorithm], preAuf = override?.preAuf ?? 0;
    return { caseId, moves, preAuf, finalAuf: validateGuidance(engine, entry, moves, preAuf) };
  });
  const repPlan = order.map((caseId) => ({ caseId, preAuf: options.preAuf === 'random' ? quarter(randomIndex(4)) : options.preAuf, yaw: options.yaw === 'random' ? quarter(randomIndex(4)) : options.yaw }));
  const challenges = repPlan.map((rep, index) => createLL(engine, { ...rep, trainer, mode: options.mode, frame: options.frame, requestId: `${id}/${index}`, epoch: index }, valid.filter((record) => record.caseId.startsWith(`${trainer}:`))));
  const run: LLRunRecord = { id, sessionId: session.id, setId, setSnapshot: selected, comparisonKey: '', repPlan, status: 'active', cursor: 0, outcomes: [], createdAt, endedAt: null,
    snapshot: structuredClone({ policy: 'll-run-v1', ...options, versions: LL_VERSIONS, guidance, challenges }), presented: false, interruptions: [] };
  run.comparisonKey = runComparisonKey(run); return validateRun(run, engine, [], [session]);
}
export function closeRep(run: RunRecord, attempt?: AttemptRecord, recoveredAt = new Date().toISOString()): RunRecord {
  if (!run.snapshot || !run.interruptions || !run.presented || run.status !== 'active' || run.cursor >= run.repPlan.length) throw Error('No presented active rep to close.');
  const interrupted = !attempt || attempt.timing.status === 'interrupted', cursor = run.cursor + 1;
  return { ...structuredClone(run), cursor, presented: false, status: cursor === run.repPlan.length ? 'complete' : 'active', endedAt: cursor === run.repPlan.length ? attempt?.endedAt ?? recoveredAt : null,
    outcomes: [...run.outcomes, attempt ? { kind: interrupted ? 'interrupted' : 'attempt', repIndex: run.cursor, attemptId: attempt.id } : { kind: 'interrupted', repIndex: run.cursor, attemptId: null }],
    interruptions: interrupted ? [...run.interruptions, run.cursor] : [...run.interruptions] };
}
export function recoverRun(run: RunRecord, recoveredAt = new Date().toISOString()): RunRecord {
  if (run.status !== 'active' && run.status !== 'interrupted') return run;
  if (run.presented) return closeRep({ ...run, status: 'active' }, undefined, recoveredAt < run.createdAt ? run.createdAt : recoveredAt);
  return { ...run, status: run.cursor === run.repPlan.length ? 'complete' : 'interrupted' };
}
const validatedGuidance = new WeakMap<CubeEngine, Map<string, QuarterTurn>>();
export function validateRun(input: unknown, engine: CubeEngine, attempts: readonly AttemptRecord[], sessions: readonly SessionRecord[]): LLRunRecord {
  boundedInput(input);
  const value = exact(input, ['id', 'sessionId', 'setId', 'setSnapshot', 'comparisonKey', 'repPlan', 'status', 'cursor', 'outcomes', 'createdAt', 'endedAt', 'snapshot', 'presented', 'interruptions']);
  const setSnapshot = validateSet(value.setSnapshot), trainer: LLTrainer = setSnapshot.trainer === 'oll' ? 'oll' : 'pll';
  const id = text(value.id), sessionId = text(value.sessionId), setId = value.setId === null ? null : text(value.setId);
  if (!sessions.some((session) => session.id === sessionId && session.trainer === trainer)) throw Error('Run session/trainer mismatch.');
  if (setId !== null && setId !== setSnapshot.id) throw Error('Run set snapshot reference mismatch.');
  const raw = exact(value.snapshot, ['policy', 'mode', 'shuffle', 'preAuf', 'yaw', 'settings', 'frame', 'versions', 'guidance', 'challenges']);
  if (raw.policy !== 'll-run-v1' || (raw.mode !== 'execution' && raw.mode !== 'recognition') || typeof raw.shuffle !== 'boolean') throw Error('Unsupported frozen run policy.');
  const s = exact(raw.settings, ['inspectionMode', 'audibleWarnings']);
  if ((s.inspectionMode !== 'untimed' && s.inspectionMode !== '15s') || typeof s.audibleWarnings !== 'boolean') throw Error('Invalid frozen timing settings.');
  exact(raw.frame, ['crossColor', 'colorOfFace']); exact(raw.versions, ['contract', 'engine', 'dataset', 'tables']);
  const frame = decodeFrame(raw.frame, engine), versions = decodeVersions(raw.versions);
  if (!same(versions, LL_VERSIONS)) throw Error('Unsupported frozen run versions.');
  let guidanceCache = validatedGuidance.get(engine);
  if (!guidanceCache) { guidanceCache = new Map(); validatedGuidance.set(engine, guidanceCache); }
  const cache = guidanceCache;
  const guidance = array(raw.guidance).map((input) => {
    const g = exact(input, ['caseId', 'moves', 'preAuf', 'finalAuf']), caseId = text(g.caseId), entry = llEntry(trainer, caseId), algorithm = moves(g.moves), preAuf = quarter(g.preAuf);
    const key = JSON.stringify([caseId, entry.datasetVersion, entry.identityPolicyVersion, algorithm, preAuf]);
    let finalAuf = cache.get(key);
    if (finalAuf === undefined) { finalAuf = validateGuidance(engine, entry, algorithm, preAuf); if (cache.size >= 256) cache.clear(); cache.set(key, finalAuf); }
    if (g.finalAuf !== finalAuf) throw Error('Frozen canonical final AUF mismatch.'); return { caseId, moves: algorithm, preAuf, finalAuf };
  }); unique(guidance.map((g) => g.caseId));
  if (!same(guidance.map((g) => g.caseId).sort(), [...setSnapshot.caseIds].sort())) throw Error('Frozen guidance membership mismatch.');
  const snapshot: LLRunRecord['snapshot'] = { policy: 'll-run-v1', mode: raw.mode, shuffle: raw.shuffle, preAuf: policy(raw.preAuf), yaw: policy(raw.yaw), settings: { inspectionMode: s.inspectionMode, audibleWarnings: s.audibleWarnings }, frame, versions, guidance, challenges: array(raw.challenges).map((c) => validateLL(c, engine)) };
  const repPlan = array(value.repPlan).map((input) => { const rep = exact(input, ['caseId', 'preAuf', 'yaw']); return { caseId: llEntry(trainer, text(rep.caseId)).id, preAuf: quarter(rep.preAuf), yaw: quarter(rep.yaw) }; });
  unique(repPlan.map((rep) => rep.caseId)); unique(snapshot.challenges.map((c) => c.challengeId));
  if (!same(repPlan.map((rep) => rep.caseId).sort(), [...setSnapshot.caseIds].sort()) || snapshot.challenges.length !== repPlan.length || (!snapshot.shuffle && !same(repPlan.map((rep) => rep.caseId), setSnapshot.caseIds))) throw Error('Frozen rep plan membership/order mismatch.');
  repPlan.forEach((rep, index) => {
    const c = snapshot.challenges[index], g = guidance.find((g) => g.caseId === rep.caseId);
    if (!c || !g || c.proof.kind !== 'case' || c.options.trainer !== trainer || c.options.caseId !== rep.caseId || c.options.preAuf !== rep.preAuf || c.options.yaw !== rep.yaw || c.options.mode !== snapshot.mode || c.requestId !== `${id}/${index}` || c.epoch !== index || !same(c.frame, frame) || !same(c.versions, versions) || (snapshot.preAuf !== 'random' && snapshot.preAuf !== rep.preAuf) || (snapshot.yaw !== 'random' && snapshot.yaw !== rep.yaw) || !same(c.proof.solution, presentLLGuidance(engine, trainer, c.start, [...invertMoves(auf(rep.preAuf)), ...yawGuidance([...auf(g.preAuf), ...g.moves], rep.yaw)]).solution)) throw Error('Challenge does not match frozen run guidance, angle or context.');
  });
  const cursor = integer(value.cursor, 0, repPlan.length), interruptions = array(value.interruptions).map((index) => integer(index, 0, cursor - 1)); unique(interruptions);
  if (typeof value.presented !== 'boolean' || !['active', 'complete', 'interrupted', 'abandoned'].includes(String(value.status))) throw Error('Invalid run state.');
  const status = value.status === 'active' ? 'active' : value.status === 'complete' ? 'complete' : value.status === 'interrupted' ? 'interrupted' : 'abandoned';
  const createdAt = date(value.createdAt), endedAt = value.endedAt === null ? null : date(value.endedAt);
  if ((status === 'complete' && cursor !== repPlan.length) || (status === 'active' && cursor === repPlan.length) || ((status === 'complete' || status === 'abandoned') !== (endedAt !== null)) || (endedAt && endedAt < createdAt) || (value.presented && (status !== 'active' || cursor >= repPlan.length))) throw Error('Run cursor/end/presentation state mismatch.');
  if (!sessions.some((session) => session.id === sessionId && session.createdAt <= createdAt) || setSnapshot.updatedAt > createdAt) throw Error('Run predates its session or set snapshot.');
  const linked = new Set<string>();
  let latestAttemptEnd = createdAt;
  const outcomes = array(value.outcomes).map((input, index): RunRecord['outcomes'][number] => {
    const o = exact(input, ['kind', 'repIndex', oKind(input) === 'skipped' ? 'caseId' : 'attemptId']);
    if (o.repIndex !== index || index >= cursor) throw Error('Run outcomes must close each preceding rep exactly once.');
    if (o.kind === 'skipped') { if (o.caseId !== repPlan[index]?.caseId || interruptions.includes(index)) throw Error('Skipped case/evidence mismatch.'); return { kind: 'skipped', repIndex: index, caseId: text(o.caseId) }; }
    if (o.kind !== 'attempt' && o.kind !== 'interrupted') throw Error('Invalid rep outcome.');
    if (o.kind === 'interrupted' && !interruptions.includes(index)) throw Error('Interruption evidence missing.');
    if (o.attemptId === null && o.kind === 'interrupted') return { kind: 'interrupted', repIndex: index, attemptId: null };
    const attemptId = text(o.attemptId), attempt = attempts.find((a) => a.id === attemptId);
    if (!attempt || linked.has(attemptId) || attempt.runId !== id || attempt.repIndex !== index || attempt.trainer !== trainer || attempt.sessionId !== sessionId || !same(attempt.challenge, snapshot.challenges[index]) || !same(attempt.settingsSnapshot, snapshot.settings) || (o.kind === 'interrupted') !== (attempt.timing.status === 'interrupted') || attempt.presentedAt < createdAt || (endedAt && attempt.endedAt > endedAt)) throw Error('Run attempt link, timing or frozen snapshot mismatch.');
    if (attempt.presentedAt < latestAttemptEnd) throw Error('Run attempts overlap or run backwards.');
    latestAttemptEnd = attempt.endedAt;
    linked.add(attemptId); return { kind: o.kind, repIndex: index, attemptId };
  });
  if (outcomes.length !== cursor || interruptions.some((index) => outcomes[index]?.kind !== 'interrupted')) throw Error('Run cursor/interruption evidence mismatch.');
  const result: LLRunRecord = { id, sessionId, setId, setSnapshot, comparisonKey: '', repPlan, status, cursor, outcomes, createdAt, endedAt, snapshot, presented: value.presented, interruptions };
  result.comparisonKey = runComparisonKey(result);
  if (text(value.comparisonKey) !== result.comparisonKey) throw Error('Forged run comparison key.'); return result;
}
function oKind(input: unknown): unknown { return exact(input, ['kind', 'repIndex'], ['attemptId', 'caseId']).kind; }
export function validateLLTraining(engine: CubeEngine, data: Parameters<SemanticValidator['validateTrainingData']>[0], attempts: AttemptRecord[], sessions: SessionRecord[]) {
  const personalAlgorithms = validateOverrideImport(engine, [...F2L_CASES, ...LL_CASES], data.personalAlgorithms), practiceSets = data.practiceSets.map(validateSet), runs = data.runs.map((r) => validateRun(r, engine, attempts, sessions));
  unique(practiceSets.map((s) => s.id)); unique(runs.map((r) => r.id));
  unique(runs.flatMap((run) => run.snapshot.challenges.map((challenge) => challenge.challengeId)));
  unique(runs.filter((run) => run.status === 'active' || run.status === 'interrupted').map((run) => run.sessionId));
  for (const attempt of attempts) if (attempt.runId && !runs.some((run) => run.id === attempt.runId && run.outcomes.some((outcome) => outcome.kind !== 'skipped' && outcome.attemptId === attempt.id && outcome.repIndex === attempt.repIndex))) throw Error('Dangling or cross-run attempt link.');
  return { personalAlgorithms, practiceSets, runs };
}
