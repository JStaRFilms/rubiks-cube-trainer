import { useState } from 'react';
import { F2L_CASES } from '../data/f2l';
import { QUARTERS } from '../cases/identity';
import type { F2LPreferences } from '../store/records';
export function F2LSettings({ value, onChange }: { value: F2LPreferences; onChange: (value: F2LPreferences) => void }) {
  const [family, setFamily] = useState('all'), [search, setSearch] = useState('');
  const visible = F2L_CASES.filter((entry) => (family === 'all' || family === entry.family) && `${entry.label} ${entry.family} ${entry.id}`.toLowerCase().includes(search.toLowerCase()));
  return <>
    <label>F2L slot policy<select value={value.slotMode} onChange={(event) => { const slotMode = event.target.value; if (slotMode === 'FR' || slotMode === 'random') onChange({ ...value, slotMode }); }}><option value="FR">FR only</option><option value="random">Random FR / FL / BR / BL</option></select></label>
    <label>F2L mode<select value={value.mode} onChange={(event) => { const mode = event.target.value; if (mode === 'execution' || mode === 'recognition') onChange({ ...value, mode }); }}><option value="execution">Execution</option><option value="recognition">Recognition</option></select></label>
    <label>Rotation view hint<select value={value.hint ? 'shown' : 'hidden'} onChange={(event) => onChange({ ...value, hint: event.target.value === 'shown' })}><option value="shown">Shown</option><option value="hidden">Hidden</option></select></label>
    <label>Setup pre-U<select value={value.preAuf} onChange={(event) => { const preAuf = event.target.value === 'random' ? 'random' : QUARTERS.find((angle) => String(angle) === event.target.value); if (preAuf !== undefined) onChange({ ...value, preAuf }); }}><option value="random">Random pre-U</option>{QUARTERS.map((angle) => <option key={angle} value={angle}>{['None', 'U', 'U2', "U'"][angle]}</option>)}</select></label>
    <p>41 verified cases. Lieberkind numbering is source-specific, not universal. Select weak cases manually using compatible history results. No automatic coaching. Recognition uncertainty is limited to this pool.</p>
    <label>Case search<input value={search} onChange={(event) => setSearch(event.target.value)} /></label>
    <label>Case family<select value={family} onChange={(event) => setFamily(event.target.value)}><option value="all">All families</option>{[...new Set(F2L_CASES.map((entry) => entry.family))].map((family) => <option key={family}>{family}</option>)}</select></label>
    <div><button type="button" onClick={() => onChange({ ...value, caseIds: F2L_CASES.map((entry) => entry.id) })}>Select all 41</button><button type="button" onClick={() => onChange({ ...value, caseIds: [] })}>Clear case selection</button><button type="button" onClick={() => onChange({ ...value, caseIds: F2L_CASES.filter((entry) => value.caseIds.includes(entry.id) || visible.includes(entry)).map((entry) => entry.id) })}>Select filtered cases</button></div>
    <p>{value.caseIds.length} selected{value.caseIds.length ? '' : '. Select at least one case.'}</p>
    {visible.map((entry) => <label className="check" key={entry.id}><input type="checkbox" checked={value.caseIds.includes(entry.id)} onChange={(event) => onChange({ ...value, caseIds: F2L_CASES.filter((item) => item.id === entry.id ? event.target.checked : value.caseIds.includes(item.id)).map((item) => item.id) })} />F2L {entry.label} · {entry.family}</label>)}
  </>;
}
