import { afterEach, describe, expect, it, vi } from 'vitest';
import { openDB } from 'idb';
import { Repository, DATABASE_VERSION, defaultSettings, storageMessage } from '../../src/store/repository';
import { parseBackup } from '../../src/store/validation';
import { attempt, backup, fixtureValidator, session } from './fixtures';
const repositories: Repository[] = [];
function repository(validator = false, name = crypto.randomUUID()) {
  const repo = new Repository(name, () => {}, validator ? fixtureValidator : undefined); repositories.push(repo); return repo;
}
afterEach(async () => { vi.restoreAllMocks(); await Promise.all(repositories.splice(0).map((repo) => repo.close())); });
describe('v1 local data', () => {
  it('migrates the actual supported version 0 fixture to all v1 stores and indexes', async () => {
    const name = crypto.randomUUID(), repo = repository(false, name); await repo.probe(); await repo.close();
    const db = await openDB(name, DATABASE_VERSION);
    expect([...db.objectStoreNames]).toEqual(['attempts', 'personalAlgorithms', 'practiceSets', 'runs', 'sessions', 'settings']);
    expect([...db.transaction('attempts').store.indexNames]).toEqual(['runId', 'sessionEnded', 'trainerEnded']); db.close();
  });
  it('retains data after an aborted forward migration fixture', async () => {
    const name = crypto.randomUUID(), repo = repository(false, name); await repo.saveSession(session); await repo.close();
    await expect(openDB(name, 2, { upgrade(db, _, __, tx) { db.createObjectStore('temporary'); void tx.done.catch(() => {}); tx.abort(); } })).rejects.toMatchObject({ name: 'AbortError' });
    expect((await repository(false, name).read()).backup.sessions).toEqual([session]);
  });
  it('refuses a newer database without resetting it', async () => {
    const name = crypto.randomUUID(), newer = await openDB(name, 2, { upgrade(db) { db.createObjectStore('sentinel'); } }); await newer.put('sentinel', 'retained', 'key'); newer.close();
    await expect(repository(false, name).read()).rejects.toMatchObject({ name: 'VersionError' });
    const verify = await openDB(name, 2); expect(await verify.get('sentinel', 'key')).toBe('retained'); verify.close();
  });
  it('acknowledges settings/sessions after commit and survives reopen', async () => {
    const name = crypto.randomUUID(), repo = repository(false, name);
    await repo.saveSettings({ ...defaultSettings, crossColor: 'blue' }); await repo.saveSession(session); await repo.close();
    const result = await repository(false, name).read(); expect(result.backup.settings[0]?.crossColor).toBe('blue'); expect(result.backup.sessions).toEqual([session]); expect(result.revision).toBe(2);
  });
  it('round-trips every currently supported record without cache/metadata', async () => {
    const repo = repository(); const original = backup(); await repo.replace(original, 0);
    const exported = (await repo.read()).backup; const decoded = await parseBackup(JSON.stringify(exported));
    await repo.replace(decoded, 1); expect((await repo.read()).backup).toEqual({ ...original, exportedAt: expect.any(String) });
    expect(JSON.stringify(exported)).not.toContain('revision'); expect(JSON.stringify(exported)).not.toContain('probe');
  });
  it.each([{ version: 2 }, { settings: [{ ...defaultSettings, theme: 'invalid' }] }, { sessions: [session, session] }, { attempts: [{ id: 'unvalidated' }] }, { runs: [{ id: 'unsupported' }] }])('rejects malformed/newer/prerequisite imports without mutation: %j', async (change) => {
    const repo = repository(); await repo.replace(backup(), 0); const before = await repo.read();
    await expect(parseBackup(JSON.stringify({ ...backup(), ...change }))).rejects.toThrow(); expect(await repo.read()).toEqual({ ...before, backup: { ...before.backup, exportedAt: expect.any(String) } });
  });
  it('rejects invalid JSON and oversized files', async () => {
    await expect(parseBackup('{')).rejects.toThrow('valid JSON'); await expect(parseBackup(' '.repeat(20 * 1024 * 1024 + 1))).rejects.toThrow('20 MiB');
  });
  it('rejects a stale preview after another tab writes', async () => {
    const name = crypto.randomUUID(), first = repository(false, name), second = repository(false, name);
    const preview = await first.read(); await second.saveSession(session);
    await expect(first.replace(backup(), preview.revision)).rejects.toThrow('changed since'); expect((await first.read()).backup.sessions).toEqual([session]);
  });
  it('rolls back all clears/inserts on quota failure', async () => {
    const repo = repository(); await repo.replace(backup(), 0);
    const write = IDBObjectStore.prototype.put;
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, value: unknown, key?: IDBValidKey) {
      if (this.name === 'sessions') throw new DOMException('Injected quota failure', 'QuotaExceededError');
      return key === undefined ? write.call(this, value) : write.call(this, value, key);
    });
    await expect(repo.replace({ ...backup(), sessions: [{ ...session, label: 'replacement' }] }, 1)).rejects.toMatchObject({ name: 'QuotaExceededError' });
    expect((await repo.read()).backup.sessions).toEqual([session]); expect((await repo.read()).revision).toBe(1);
  });
  it('does not falsely acknowledge an aborted settings write', async () => {
    const repo = repository(); await repo.saveSettings(defaultSettings);
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(() => { throw new DOMException('Disk unavailable', 'QuotaExceededError'); });
    await expect(repo.saveSettings({ ...defaultSettings, crossColor: 'red' })).rejects.toMatchObject({ name: 'QuotaExceededError' });
    expect((await repo.read()).backup.settings[0]?.crossColor).toBe('white'); expect(storageMessage(new DOMException('', 'QuotaExceededError'))).toContain('Nothing was saved');
  });
  it('rejects attempts without compatible validation and commits a validated fixture immediately', async () => {
    await expect(repository().saveAttempt(attempt)).rejects.toThrow('compatible cube validator');
    const repo = repository(true); await repo.saveSession(session); await repo.saveAttempt(attempt);
    expect((await repo.read()).backup.attempts).toEqual([attempt]);
  });
  it('keeps session trainer categories and saved challenges immutable', async () => {
    const repo = repository(true); await repo.saveSession(session); await repo.saveAttempt(attempt);
    await expect(repo.saveSession({ ...session, trainer: 'pll' })).rejects.toThrow('cannot change trainer');
    vi.spyOn(fixtureValidator, 'validateAttempt').mockResolvedValueOnce({ ...attempt, preparationMs: 6000 });
    await expect(repo.saveAttempt({ ...attempt, preparationMs: 6000 })).rejects.toThrow('different record');
    expect((await repo.read()).backup.attempts).toEqual([attempt]);
  });
  it('does not acknowledge an attempt on transaction failure', async () => {
    const repo = repository(true); await repo.saveSession(session);
    const write = IDBObjectStore.prototype.put;
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, value: unknown, key?: IDBValidKey) {
      if (this.name === 'attempts') throw new DOMException('Injected failure', 'QuotaExceededError');
      return key === undefined ? write.call(this, value) : write.call(this, value, key);
    });
    await expect(repo.saveAttempt(attempt)).rejects.toMatchObject({ name: 'QuotaExceededError' }); expect((await repo.read()).backup.attempts).toEqual([]);
  });
});
