import type { ZBLLChallenge } from '../zbll/model';
import { useState } from 'react';
import { ZBLL_MANIFEST } from '../data/zbll';
import { attemptStatistics, comparisonKey, configurationLabel, formatMs } from '../statistics/attempts';
import type { AttemptRecord, ZBLLPreferences } from '../store/records';
export function ZBLLStatistics({ attempts, selection }: { attempts: readonly AttemptRecord[]; selection: ZBLLPreferences }) {
  const [family, setFamily] = useState('all'), [subset, setSubset] = useState('all'), [caseId, setCaseId] = useState('all');
  const saved = attempts.filter((a): a is AttemptRecord & { challenge: ZBLLChallenge } => a.trainer === 'zbll' && a.challenge.options.trainer === 'zbll');
  const attempted = new Set(saved.map((a) => a.challenge.proof.kind === 'case' ? a.challenge.proof.caseId : ''));
  const members = ZBLL_MANIFEST.membership.filter((m) => (family === 'all' || m.family === family) && (subset === 'all' || `${m.family}/${m.subset}` === subset));
  const filtered = saved.filter((a) => members.some((m) => m.caseId === a.challenge.proof.caseId) && (caseId === 'all' || a.challenge.proof.caseId === caseId));
  const keys = [...new Set(filtered.map(comparisonKey))];
  return <section aria-label="ZBLL coverage and statistics">
    <h3>ZBLL coverage in this session</h3>
    <p>{attempted.size}/493 available canonical cases attempted. {selection.caseIds.filter((id) => attempted.has(id)).length}/{selection.caseIds.length} of the currently selected pool attempted. Saved DNF and interrupted records count as attempts, not successful solves. Angles and aliases never add cases.</p>
    <label>Statistics family<select value={family} onChange={(event) => { setFamily(event.target.value); setSubset('all'); setCaseId('all'); }}><option value="all">All families</option>{Object.keys(ZBLL_MANIFEST.families).map((f) => <option key={f}>{f}</option>)}</select></label>
    <label>Statistics subset<select value={subset} onChange={(event) => { setSubset(event.target.value); setCaseId('all'); }}><option value="all">All subsets</option>{[...new Set(ZBLL_MANIFEST.membership.filter((m) => family === 'all' || m.family === family).map((m) => `${m.family}/${m.subset}`))].map((g) => <option key={g}>{g}</option>)}</select></label>
    <label>Statistics case<select value={caseId} onChange={(event) => setCaseId(event.target.value)}><option value="all">All matching cases</option>{members.map((m) => <option key={m.caseId} value={m.caseId}>{m.sourceLabel} · {m.referenceLabel}</option>)}</select></label>
    <p>Filtered saved attempts: {filtered.length}. Execution and preparation summaries below compare only the same case, mode, inspection, frame, declared pool/angle policy, actual angle and frozen guidance. No pooled family ranking or mastery inference.</p>
    {['family', 'subset'].map((level) => <details key={level}><summary>{level === 'family' ? 'Family' : 'COLL subset'} attempts and failures</summary>{[...new Set(members.map((m) => level === 'family' ? m.family : `${m.family}/${m.subset}`))].map((group) => {
      const ids: string[] = members.filter((m) => (level === 'family' ? m.family : `${m.family}/${m.subset}`) === group).map((m) => m.caseId), records = filtered.filter((a) => ids.includes(a.challenge.proof.caseId)), stats = attemptStatistics(records);
      return <p key={group}>{group}: {new Set(records.map((a) => a.challenge.proof.caseId)).size}/{ids.length} available cases attempted · {stats.total} attempts · {stats.successful} successful · {stats.dnf} DNF · {stats.interrupted} interrupted</p>;
    })}</details>)}
    {keys.map((key) => { const records = filtered.filter((a) => comparisonKey(a) === key), first = records[0]; if (!first) return null; const stats = attemptStatistics(records);
      return <details key={key}><summary>{configurationLabel(first)} · {stats.total} attempts</summary><p>{stats.successful} successful · {stats.dnf} DNF · {stats.interrupted} interrupted. Effective execution best {formatMs(stats.execution?.best ?? null)}, mean {formatMs(stats.execution?.mean ?? null)}, n={stats.execution?.count ?? 0}. Preparation mean {formatMs(stats.preparation?.mean ?? null)}, n={stats.preparation?.count ?? 0}. Preparation includes scrambling and completed DNFs, excludes interruptions.</p></details>;
    })}
  </section>;
}
