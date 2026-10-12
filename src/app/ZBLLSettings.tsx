import { useState } from 'react';
import { ZBLL_MANIFEST } from '../data/zbll';
import { QUARTERS } from '../cases/identity';
import type { ZBLLPreferences } from '../store/records';
export function ZBLLSettings({ value, onChange }: { value: ZBLLPreferences; onChange: (value: ZBLLPreferences) => void }) {
  const [family, setFamily] = useState('all'), [subset, setSubset] = useState('all'), [search, setSearch] = useState('');
  const groups = [...new Set(ZBLL_MANIFEST.membership.filter((member) => family === 'all' || member.family === family).map((member) => `${member.family}/${member.subset}`))];
  const visible = ZBLL_MANIFEST.membership.filter((member) => (family === 'all' || member.family === family) && (subset === 'all' || `${member.family}/${member.subset}` === subset) && `${member.sourceLabel} ${member.referenceLabel} ${member.caseId}`.toLowerCase().includes(search.toLowerCase()));
  return <>
    <label>ZBLL mode<select value={value.mode} onChange={(event) => { const mode = event.target.value; if (mode === 'execution' || mode === 'recognition') onChange({ ...value, mode }); }}><option value="execution">Execution</option><option value="recognition">Recognition</option></select></label>
    <label className="check"><input type="checkbox" checked={value.shuffle} onChange={(event) => onChange({ ...value, shuffle: event.target.checked })} />Shuffle selected cases</label>
    {(['preAuf', 'yaw'] as const).map((key) => <label key={key}>{key === 'preAuf' ? 'Setup pre-U' : 'Setup yaw'}<select value={value[key]} onChange={(event) => { const angle = event.target.value === 'random' ? 'random' : QUARTERS.find((angle) => String(angle) === event.target.value); if (angle !== undefined) onChange({ ...value, [key]: angle }); }}><option value="random">Random</option>{QUARTERS.map((q) => <option key={q} value={q}>{q === 0 ? 'None' : `${key === 'preAuf' ? 'U' : 'y'}${q === 1 ? '' : q === 2 ? '2' : "'"}`}</option>)}</select></label>)}
    <p>493 canonical cases, including 21 shared PLL cases. Groups and recognition codes are source-specific, not universal numbering. Ordered practice cycles through the saved selection; shuffle visits each selected case once before reshuffling. This is individual practice, not a timed set.</p>
    <label>ZBLL family<select value={family} onChange={(event) => { setFamily(event.target.value); setSubset('all'); }}><option value="all">All families</option>{Object.keys(ZBLL_MANIFEST.families).map((f) => <option key={f}>{f}</option>)}</select></label>
    <label>Sourced COLL subset<select value={subset} onChange={(event) => setSubset(event.target.value)}><option value="all">All subsets</option>{groups.map((group) => <option key={group}>{group}</option>)}</select></label>
    <label>Case search<input value={search} onChange={(event) => setSearch(event.target.value)} /></label>
    <div><button type="button" onClick={() => onChange({ ...value, caseIds: ZBLL_MANIFEST.expectedIds.slice() })}>Select all 493</button><button type="button" onClick={() => onChange({ ...value, caseIds: [] })}>Clear case selection</button><button type="button" onClick={() => onChange({ ...value, caseIds: visible.map((member) => member.caseId) })}>Use filtered cases only</button></div>
    <p>{value.caseIds.length} selected{value.caseIds.length ? '' : '. Select at least one case.'} Recognition uncertainty is limited to this pool.</p>
    {visible.map((member) => <label className="check" key={member.caseId}><input type="checkbox" checked={value.caseIds.includes(member.caseId)} onChange={(event) => onChange({ ...value, caseIds: ZBLL_MANIFEST.membership.filter((item) => item.caseId === member.caseId ? event.target.checked : value.caseIds.includes(item.caseId)).map((item) => item.caseId) })} />{member.sourceLabel} · COLL {member.referenceLabel} · {member.family}/{member.subset}</label>)}
  </>;
}
