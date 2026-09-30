import { openDB, type DBSchema, type IDBPDatabase, type IDBPObjectStore } from 'idb';
import { defaultSettings, personalStores, type AttemptRecord, type PersonalAlgorithmRecord, type PracticeSetRecord, type RunRecord, type SemanticValidator, type SessionRecord, type SettingsRecord, type TrainerBackupV1 } from './records';
import { boundedInput, DataError, decodeBackup, decodeSession, decodeSettings, validateAttemptDurations } from './validation';
export const DATABASE_VERSION = 1;
interface Metadata { key: 'revision' | 'probe'; value: number }
interface PersonalDatabase extends DBSchema {
  settings: { key: string; value: SettingsRecord | Metadata };
  sessions: { key: string; value: SessionRecord; indexes: { trainer: string } };
  attempts: { key: string; value: AttemptRecord; indexes: { sessionEnded: [string, string]; trainerEnded: [string, string]; runId: string } };
  personalAlgorithms: { key: [string, string]; value: PersonalAlgorithmRecord };
  practiceSets: { key: string; value: PracticeSetRecord };
  runs: { key: string; value: RunRecord; indexes: { sessionId: string } };
}
export function storageMessage(error: unknown): string {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') return 'Storage is full. Nothing was saved. Make a backup and free device space, then retry.';
  if (error instanceof DOMException && error.name === 'VersionError') return 'This browser has a newer database. Open the newer app; do not clear storage.';
  return error instanceof Error ? `${error.message} Nothing was saved or replaced.` : 'Local storage failed. Nothing was saved or replaced.';
}
export interface AttemptUndo {
  before: AttemptRecord;
  after: AttemptRecord | null;
  beforeRun: RunRecord | null;
  afterRun: RunRecord | null;
  revision: number;
}
export class Repository {
  private connection: Promise<IDBPDatabase<PersonalDatabase>> | null = null;
  private latestUndo: AttemptUndo | null = null;
  constructor(private readonly name = 'cube-trainer', private readonly notify: (message: string) => void = () => {}, private readonly validator?: SemanticValidator) {}
  private db(): Promise<IDBPDatabase<PersonalDatabase>> {
    this.connection ??= openDB<PersonalDatabase>(this.name, DATABASE_VERSION, {
      upgrade(db, oldVersion) {
        // Version 0 is the only supported predecessor. There is no historical app schema.
        if (oldVersion === 0) {
          db.createObjectStore('settings', { keyPath: 'key' });
          db.createObjectStore('sessions', { keyPath: 'id' }).createIndex('trainer', 'trainer');
          const attempts = db.createObjectStore('attempts', { keyPath: 'id' });
          attempts.createIndex('sessionEnded', ['sessionId', 'endedAt']);
          attempts.createIndex('trainerEnded', ['trainer', 'endedAt']);
          attempts.createIndex('runId', 'runId');
          db.createObjectStore('personalAlgorithms', { keyPath: ['caseId', 'slot'] });
          db.createObjectStore('practiceSets', { keyPath: 'id' });
          db.createObjectStore('runs', { keyPath: 'id' }).createIndex('sessionId', 'sessionId');
        }
      },
      blocked: () => this.notify('Local database upgrade blocked. Close other Cube Trainer tabs, then retry.'),
      blocking: () => { void this.close(); this.notify('Database version changed in another tab. Reload this tab before editing.'); },
      terminated: () => { this.connection = null; this.notify('Local database connection ended. Retry without clearing storage.'); },
    }).catch((error: unknown) => { this.connection = null; throw error; });
    return this.connection;
  }
  async close(): Promise<void> { const connection = this.connection; this.connection = null; (await connection)?.close(); }
  async probe(): Promise<void> {
    const db = await this.db(), tx = db.transaction('settings', 'readwrite');
    try {
      await tx.store.put({ key: 'probe', value: 1 });
      const record = await tx.store.get('probe');
      if (!record || !('value' in record) || record.value !== 1) throw new DataError('Local storage probe failed.');
      await tx.store.delete('probe'); await tx.done;
    } catch (error) { try { tx.abort(); } catch { /* Already aborted. */ } await tx.done.catch(() => {}); throw error; }
  }
  async read(): Promise<{ backup: TrainerBackupV1; revision: number }> {
    const db = await this.db(), tx = db.transaction(personalStores, 'readonly');
    const [settings, sessions, attempts, personalAlgorithms, practiceSets, runs] = await Promise.all(personalStores.map((store) => tx.objectStore(store).getAll()));
    const metadata = await tx.objectStore('settings').get('revision'); await tx.done;
    const backup = await decodeBackup({ format: 'cube-trainer-backup', version: 1, exportedAt: new Date().toISOString(), cubeContract: 'cube3-facelets-v1',
      settings: settings?.filter((s) => 'key' in s && s.key === 'preferences'), sessions, attempts, personalAlgorithms, practiceSets, runs }, this.validator);
    return { backup, revision: metadata && 'value' in metadata ? metadata.value : 0 };
  }
  async saveSettings(input: SettingsRecord): Promise<void> {
    const record = decodeSettings(input), db = await this.db(), tx = db.transaction('settings', 'readwrite');
    try { await tx.store.put(record); await this.bump(tx.store); await tx.done; }
    catch (error) { try { tx.abort(); } catch { /* Already aborted. */ } await tx.done.catch(() => {}); throw error; }
  }
  async saveSession(input: SessionRecord): Promise<void> {
    const record = decodeSession(input), db = await this.db(), tx = db.transaction(['sessions', 'settings'], 'readwrite');
    try {
      const existing = await tx.objectStore('sessions').get(record.id);
      if (existing && existing.trainer !== record.trainer) throw new DataError('A session cannot change trainer. Create a new session instead.');
      await tx.objectStore('sessions').put(record); await this.bump(tx.objectStore('settings')); await tx.done;
    }
    catch (error) { try { tx.abort(); } catch { /* Already aborted. */ } await tx.done.catch(() => {}); throw error; }
  }
  async saveAttempt(input: unknown, run?: RunRecord): Promise<void> {
    if (!this.validator) throw new DataError('Attempt saving needs the compatible cube validator. Training is not yet available.');
    boundedInput(input);
    const attempt = await this.validator.validateAttempt(input); validateAttemptDurations(attempt);
    const current = await this.read();
    const session = current.backup.sessions.find((s) => s.id === attempt.sessionId);
    if (!session || session.trainer !== attempt.trainer || attempt.challenge.options.trainer !== attempt.trainer) throw new DataError('Attempt/session trainer does not match.');
    if (attempt.runId && (!run || run.id !== attempt.runId)) throw new DataError('A run-linked attempt requires its atomic run outcome.');
    if (run) await this.validator.validateTrainingData({ personalAlgorithms: [], practiceSets: current.backup.practiceSets, runs: [run] }, [...current.backup.attempts.filter((a) => a.id !== attempt.id), attempt], current.backup.sessions);
    const db = await this.db(), tx = db.transaction(['settings', 'sessions', 'attempts', 'runs'], 'readwrite');
    try {
      const storedSession = await tx.objectStore('sessions').get(attempt.sessionId);
      if (!storedSession || storedSession.trainer !== attempt.trainer) throw new DataError('Session changed before saving.');
      const metadata = await tx.objectStore('settings').get('revision');
      if ((metadata && 'value' in metadata ? metadata.value : 0) !== current.revision) throw new DataError('Local data changed before saving. Retry this record.');
      const existing = await tx.objectStore('attempts').get(attempt.id);
      if (existing && JSON.stringify(existing) !== JSON.stringify(attempt)) throw new DataError('This attempt ID already has a different record. Historical challenges cannot be overwritten.');
      await tx.objectStore('attempts').put(attempt);
      if (run) await tx.objectStore('runs').put(run);
      await this.bump(tx.objectStore('settings')); await tx.done;
    } catch (error) { try { tx.abort(); } catch { /* Already aborted. */ } await tx.done.catch(() => {}); throw error; }
  }
  async editAttempt(id: string, kind: AttemptRecord['penalty']['kind'], expectedRevision: number): Promise<AttemptUndo> {
    return this.mutateAttempt(id, kind, expectedRevision);
  }
  async deleteAttempt(id: string, expectedRevision: number): Promise<AttemptUndo> {
    return this.mutateAttempt(id, null, expectedRevision);
  }
  private async mutateAttempt(id: string, kind: AttemptRecord['penalty']['kind'] | null, expectedRevision: number): Promise<AttemptUndo> {
    const { backup, revision } = await this.read();
    if (revision !== expectedRevision) throw new DataError('Local data changed. Refresh history before editing.');
    const before = backup.attempts.find((a) => a.id === id);
    if (!before) throw new DataError('Attempt no longer exists. Refresh history.');
    const after: AttemptRecord | null = kind === null ? null : { ...before, penalty: { kind, source: kind === 'none' ? 'none' : 'manual' } };
    const beforeRun = before.runId ? backup.runs.find((r) => r.id === before.runId) ?? null : null;
    if (before.runId && !beforeRun) throw new DataError('Attempt run is missing. No history was changed.');
    const afterRun: RunRecord | null = beforeRun && kind === null ? { ...beforeRun, status: 'interrupted',
      outcomes: beforeRun.outcomes.map((outcome) => outcome.kind !== 'skipped' && outcome.attemptId === id
        ? { kind: 'interrupted', repIndex: outcome.repIndex, attemptId: null } : outcome) } : beforeRun;
    await decodeBackup({ ...backup, attempts: backup.attempts.filter((a) => a.id !== id).concat(after ? [after] : []),
      runs: backup.runs.map((r) => r.id === afterRun?.id ? afterRun : r) }, this.validator);
    await this.writeAttemptChange(before.id, after, afterRun, expectedRevision);
    const undo = { before: structuredClone(before), after: structuredClone(after), beforeRun: structuredClone(beforeRun), afterRun: structuredClone(afterRun), revision: revision + 1 };
    this.latestUndo = structuredClone(undo); return undo;
  }
  async undoAttempt(token: AttemptUndo): Promise<void> {
    if (!this.latestUndo || JSON.stringify(token) !== JSON.stringify(this.latestUndo)) throw new DataError('This undo has expired or changed.');
    const undo = structuredClone(this.latestUndo);
    const { backup, revision } = await this.read();
    if (revision !== undo.revision) throw new DataError('Local data changed. This undo has expired.');
    const current = backup.attempts.find((a) => a.id === undo.before.id) ?? null;
    const currentRun = undo.afterRun ? backup.runs.find((r) => r.id === undo.afterRun?.id) ?? null : null;
    if (JSON.stringify(current) !== JSON.stringify(undo.after) || JSON.stringify(currentRun) !== JSON.stringify(undo.afterRun)) throw new DataError('History changed. This undo has expired.');
    await decodeBackup({ ...backup, attempts: backup.attempts.filter((a) => a.id !== undo.before.id).concat(undo.before),
      runs: backup.runs.map((r) => r.id === undo.beforeRun?.id ? undo.beforeRun : r) }, this.validator);
    await this.writeAttemptChange(undo.before.id, undo.before, undo.beforeRun, undo.revision);
    this.latestUndo = null;
  }
  private async writeAttemptChange(id: string, attempt: AttemptRecord | null, run: RunRecord | null, expectedRevision: number): Promise<void> {
    const db = await this.db(), tx = db.transaction(['settings', 'attempts', 'runs'], 'readwrite');
    try {
      const metadata = await tx.objectStore('settings').get('revision');
      if ((metadata && 'value' in metadata ? metadata.value : 0) !== expectedRevision) throw new DataError('Local data changed before editing. Refresh history.');
      if (attempt) await tx.objectStore('attempts').put(attempt); else await tx.objectStore('attempts').delete(id);
      if (run) await tx.objectStore('runs').put(run);
      await this.bump(tx.objectStore('settings')); await tx.done;
    } catch (error) { try { tx.abort(); } catch { /* Already aborted. */ } await tx.done.catch(() => {}); throw error; }
  }
  async replace(input: TrainerBackupV1, expectedRevision: number): Promise<void> {
    const backup = await decodeBackup(input, this.validator), db = await this.db(), tx = db.transaction(personalStores, 'readwrite');
    try {
      const metadata = await tx.objectStore('settings').get('revision');
      const revision = metadata && 'value' in metadata ? metadata.value : 0;
      if (revision !== expectedRevision) throw new DataError('Local data changed since this preview. Validate the file again before replacing.');
      for (const store of personalStores) await tx.objectStore(store).clear();
      for (const record of backup.settings) await tx.objectStore('settings').put(record);
      for (const record of backup.sessions) await tx.objectStore('sessions').put(record);
      for (const record of backup.attempts) await tx.objectStore('attempts').put(record);
      for (const record of backup.personalAlgorithms) await tx.objectStore('personalAlgorithms').put(record);
      for (const record of backup.practiceSets) await tx.objectStore('practiceSets').put(record);
      for (const record of backup.runs) await tx.objectStore('runs').put(record.status === 'active' ? { ...record, status: 'interrupted' } : record);
      await tx.objectStore('settings').put({ key: 'revision', value: revision + 1 }); await tx.done;
    } catch (error) { try { tx.abort(); } catch { /* Already aborted. */ } await tx.done.catch(() => {}); throw error; }
  }
  private async bump(store: IDBPObjectStore<PersonalDatabase, ArrayLike<typeof personalStores[number]>, 'settings', 'readwrite'>): Promise<void> {
    const metadata = await store.get('revision');
    await store.put({ key: 'revision', value: (metadata && 'value' in metadata ? metadata.value : 0) + 1 });
  }
}
export { defaultSettings };
interface SolverDatabase extends DBSchema { tables: { key: string; value: { cacheKey: string; engineVersion: string; contractVersion: number; tableVersion: string; moveMetric: string; framePolicyVersion: string; checksum: string; byteLength: number; bytes: ArrayBuffer } } }
export async function openSolverDatabase() {
  return openDB<SolverDatabase>('cube-trainer-solver', 1, { upgrade(db) { db.createObjectStore('tables', { keyPath: 'cacheKey' }); } });
}
