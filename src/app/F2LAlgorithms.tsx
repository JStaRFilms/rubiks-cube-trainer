import { useEffect, useRef, useState } from 'react';
import { F2L_CASES } from '../data/f2l';
import { ENGINE_VERSION } from '../cube/version';
import { canonicalText, parseNotation } from '../cube/notation';
import { QUARTERS, SLOTS } from '../cases/identity';
import { F2LClient } from '../f2l/client';
import { f2lEntry, rotateGuidance } from '../f2l/model';
import type { PersonalAlgorithmRecord } from '../store/records';
import { Repository, storageMessage } from '../store/repository';
export function F2LAlgorithms({ repository, onBusy, onChanged }: { repository: Repository; onBusy: (busy: boolean) => void; onChanged: () => Promise<void> }) {
  const [caseId, setCaseId] = useState('f2l:lieberkind-v1:001'), [slot, setSlot] = useState<PersonalAlgorithmRecord['slot']>('canonical');
  const [notation, setNotation] = useState(''), [preAuf, setPreAuf] = useState<PersonalAlgorithmRecord['preAuf']>(0);
  const [revision, setRevision] = useState(0), [hasOverride, setHasOverride] = useState(false), [busy, setBusy] = useState(false);
  const [validated, setValidated] = useState<PersonalAlgorithmRecord | null>(null), [message, setMessage] = useState('Loading current guidance…'), [error, setError] = useState('');
  const [client] = useState(() => new F2LClient()), epoch = useRef(0), mounted = useRef(true);
  async function load(id: string, scope: PersonalAlgorithmRecord['slot']) {
    const mine = ++epoch.current;
    setBusy(true); onBusy(true); setValidated(null); setError('');
    try {
      const { backup, revision } = await repository.read();
      if (!mounted.current || mine !== epoch.current) return;
      const entry = f2lEntry(id), previous = backup.personalAlgorithms.find((value) => value.caseId === id && value.slot === scope);
      setRevision(revision); setHasOverride(!!previous); setPreAuf(previous?.preAuf ?? 0);
      setNotation(canonicalText(previous?.moves ?? (scope === 'canonical' ? entry.defaultAlgorithm : rotateGuidance(entry.defaultAlgorithm, scope))));
      setMessage(previous ? 'Personal guidance loaded. Validate any changes before saving.' : 'Sourced default. Validate before saving a personal algorithm.');
    } catch (reason) { if (mounted.current && mine === epoch.current) setError(storageMessage(reason)); }
    finally { if (mounted.current && mine === epoch.current) { setBusy(false); onBusy(false); } }
  }
  useEffect(() => {
    mounted.current = true; void Promise.resolve().then(() => { if (mounted.current) return load('f2l:lieberkind-v1:001', 'canonical'); });
    return () => { mounted.current = false; client.suspend(); };
    // The initial editor identity is fixed. Subsequent selections load from their own events.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, repository]);
  const entry = f2lEntry(caseId);
  async function perform(action: () => Promise<void>) {
    setBusy(true); onBusy(true); setError('');
    try { await action(); } catch (reason) { setMessage('Validation or save failed. Previous guidance retained.'); setError(`${storageMessage(reason)} Your previous algorithms and history are unchanged.`); }
    finally { setBusy(false); onBusy(false); }
  }
  return <section className="algorithm-editor" data-timer-input="isolated" aria-busy={busy}>
    <p>Algorithms change guidance only. Canonical setup and old review stay unchanged. Slot guidance wins over canonical fallback, then sourced default.</p>
    <label>Algorithm case<select disabled={busy} value={caseId} onChange={(event) => { const id = event.target.value; setCaseId(id); void load(id, slot); }}>{F2L_CASES.map((entry) => <option key={entry.id} value={entry.id}>F2L {entry.label} · {entry.family}</option>)}</select></label>
    <label>Algorithm scope<select disabled={busy} value={slot} onChange={(event) => { const scope = event.target.value === 'canonical' ? 'canonical' : SLOTS.find((value) => value === event.target.value); if (scope) { setSlot(scope); void load(caseId, scope); } }}><option value="canonical">Canonical FR fallback</option>{SLOTS.map((slot) => <option key={slot}>{slot}</option>)}</select></label>
    <p>F2L {entry.label} · {entry.family}. Hold the displayed training frame; canonical guidance uses FR. Explicit pre-AUF applies before your moves, after undoing the presented pre-U.</p>
    <label>Algorithm pre-AUF<select disabled={busy} value={preAuf} onChange={(event) => { const angle = QUARTERS.find((value) => String(value) === event.target.value); if (angle !== undefined) { setPreAuf(angle); setValidated(null); setMessage('Editing. Validate before saving.'); } }}>{QUARTERS.map((angle) => <option key={angle} value={angle}>{['None', 'U', 'U2', "U'"][angle]}</option>)}</select></label>
    <label>Personal algorithm<textarea disabled={busy} value={notation} maxLength={65536} onChange={(event) => { setNotation(event.target.value); setValidated(null); setMessage('Editing. Validate before saving.'); }} /></label>
    <p>Sourced default for this scope: {canonicalText(slot === 'canonical' ? entry.defaultAlgorithm : rotateGuidance(entry.defaultAlgorithm, slot))}</p>
    <button disabled={busy || !notation.trim()} onClick={() => void perform(async () => {
      setValidated(null); setMessage('Validating the intended case…');
      const proposed: PersonalAlgorithmRecord = { caseId, slot, moves: parseNotation(notation), preAuf, updatedAt: new Date().toISOString(), identityKey: entry.identityKey, identityPolicyVersion: entry.identityPolicyVersion, validatedDatasetVersion: entry.datasetVersion, validatedEngineVersion: ENGINE_VERSION };
      const result = await client.validateTrainingData({ personalAlgorithms: [proposed], practiceSets: [], runs: [] });
      const valid = result.personalAlgorithms[0]; if (!valid) throw Error('Algorithm validation returned no record.');
      setValidated(valid); setMessage('Valid for this intended case. Not saved yet.');
    })}>Validate algorithm</button>
    <button disabled={busy || !validated} onClick={() => void perform(async () => {
      if (!validated) return;
      setMessage('Saving algorithm…'); await repository.savePersonalAlgorithm(validated, revision); await onChanged(); await load(caseId, slot); setMessage('Algorithm saved on this device.');
    })}>Save algorithm</button>
    <button disabled={busy || !hasOverride} onClick={() => void perform(async () => {
      await repository.resetPersonalAlgorithm(caseId, slot, revision); await onChanged(); await load(caseId, slot); setMessage('Override removed. Default or canonical fallback restored for future attempts.');
    })}>Use default</button>
    <button disabled={busy} onClick={() => void load(caseId, slot)}>Reload algorithm</button>
    <p role="status">{message}</p>{error && <p role="alert" className="error">{error}</p>}
  </section>;
}
