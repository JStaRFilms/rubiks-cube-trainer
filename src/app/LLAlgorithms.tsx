import { useEffect, useRef, useState } from 'react';
import { ENGINE_VERSION } from '../cube/version';
import { canonicalText, parseNotation } from '../cube/notation';
import { QUARTERS } from '../cases/identity';
import { LLClient } from '../ll/client';
import { llEntry, llLibrary, type LLTrainer } from '../ll/model';
import type { PersonalAlgorithmRecord } from '../store/records';
import { Repository, storageMessage } from '../store/repository';
export function LLAlgorithms({ trainer, repository, onBusy, onChanged }: { trainer: LLTrainer; repository: Repository; onBusy: (busy: boolean) => void; onChanged: () => Promise<void> }) {
  const first = llLibrary(trainer)[0]; if (!first) throw Error('Last-layer library unavailable.');
  const [caseId, setCaseId] = useState(first.id), [notation, setNotation] = useState(''), [preAuf, setPreAuf] = useState<PersonalAlgorithmRecord['preAuf']>(0);
  const [revision, setRevision] = useState(0), [hasOverride, setHasOverride] = useState(false), [busy, setBusy] = useState(false), [valid, setValid] = useState<PersonalAlgorithmRecord | null>(null);
  const [message, setMessage] = useState('Loading guidance…'), [error, setError] = useState(''), [client] = useState(() => new LLClient()), epoch = useRef(0), mounted = useRef(true);
  async function load(id: string) {
    const mine = ++epoch.current; setBusy(true); onBusy(true); setValid(null); setError('');
    try { const current = await repository.read(); if (!mounted.current || mine !== epoch.current) return; const entry = llEntry(trainer, id), record = current.backup.personalAlgorithms.find((record) => record.caseId === id);
      setRevision(current.revision); setHasOverride(!!record); setNotation(canonicalText(record?.moves ?? entry.defaultAlgorithm)); setPreAuf(record?.preAuf ?? 0); setMessage(record ? 'Personal guidance loaded.' : 'Sourced default. Validate changes before saving.');
    } catch (error) { if (mounted.current) setError(storageMessage(error)); } finally { if (mounted.current && mine === epoch.current) { setBusy(false); onBusy(false); } }
  }
  useEffect(() => { mounted.current = true; void Promise.resolve().then(() => { if (mounted.current) return load(first.id); }); return () => { mounted.current = false; client.suspend(); };
    // Initial identity is fixed for this mounted trainer editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, repository, trainer]);
  async function perform(action: () => Promise<void>) { setBusy(true); onBusy(true); setError(''); try { await action(); } catch (error) { setError(`${storageMessage(error)} Previous guidance and history are unchanged.`); } finally { setBusy(false); onBusy(false); } }
  const entry = llEntry(trainer, caseId);
  return <section className="algorithm-editor" aria-busy={busy} data-timer-input="isolated">
    <p>Personal algorithms change future guidance only. Canonical setup, case identity and frozen runs stay unchanged.</p>
    <label>Algorithm case<select value={caseId} disabled={busy} onChange={(event) => { setCaseId(event.target.value); void load(event.target.value); }}>{llLibrary(trainer).map((entry) => <option key={entry.id} value={entry.id}>{trainer.toUpperCase()} {entry.label} · {entry.family}</option>)}</select></label>
    <p>{trainer === 'oll' ? 'Correct OLL may change permutation. It must preserve F2L and orient LL.' : 'PLL must solve the intended permutation. Required final AUF is validated and shown with the actual presented guidance.'} Canonical guidance starts in the displayed frame. Authored pre-AUF applies after undoing the presented pre-U.</p>
    <label>Algorithm pre-AUF<select value={preAuf} disabled={busy} onChange={(event) => { const q = QUARTERS.find((q) => String(q) === event.target.value); if (q !== undefined) { setPreAuf(q); setValid(null); } }}>{QUARTERS.map((q) => <option key={q} value={q}>{['None', 'U', 'U2', "U'"][q]}</option>)}</select></label>
    <label>Personal algorithm<textarea value={notation} maxLength={65536} disabled={busy} onChange={(event) => { setNotation(event.target.value); setValid(null); setMessage('Editing. Validate before saving.'); }} /></label>
    <p>Sourced default: {canonicalText(entry.defaultAlgorithm)} · Speeden {entry.sourceLabel}</p>
    <button disabled={busy || !notation.trim()} onClick={() => void perform(async () => { setValid(null); setMessage('Validating intended case…'); const record: PersonalAlgorithmRecord = { caseId, slot: 'canonical', moves: parseNotation(notation), preAuf, updatedAt: new Date().toISOString(), identityKey: entry.identityKey, identityPolicyVersion: entry.identityPolicyVersion, validatedDatasetVersion: entry.datasetVersion, validatedEngineVersion: ENGINE_VERSION };
      const result = await client.validateTrainingData({ personalAlgorithms: [record], practiceSets: [], runs: [] }); const accepted = result.personalAlgorithms[0]; if (!accepted) throw Error('No validated algorithm returned.'); setValid(accepted); setMessage('Valid for this intended case. Not saved yet.'); })}>Validate algorithm</button>
    <button disabled={busy || !valid} onClick={() => void perform(async () => { if (!valid) return; await repository.savePersonalAlgorithm(valid, revision); await onChanged(); await load(caseId); setMessage('Algorithm saved on this device. Frozen runs are unchanged.'); })}>Save algorithm</button>
    <button disabled={busy || !hasOverride} onClick={() => void perform(async () => { await repository.resetPersonalAlgorithm(caseId, 'canonical', revision); await onChanged(); await load(caseId); setMessage('Override removed. Future runs use the sourced default.'); })}>Use default</button>
    <button disabled={busy} onClick={() => void load(caseId)}>Reload algorithm</button><p role="status">{message}</p>{error && <p role="alert" className="error">{error}</p>}
  </section>;
}
