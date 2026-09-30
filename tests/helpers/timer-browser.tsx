// TEST ONLY. Bundled by browser-server.mjs, never by the application build.
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { TimerPractice } from '../../src/app/TimerPractice';
import { AttemptHistory } from '../../src/app/AttemptHistory';
import { TimerController } from '../../src/timer/controller';
import { Repository } from '../../src/store/repository';
import { activityStore, enterActivity, lockUpdate, releaseUpdate } from '../../src/pwa/activity';
import { fixturePresentation, timerFixtureValidator } from './timer-fixtures';
import '../../src/app/styles.css';
const repository = new Repository('timer-test-only', () => {}, timerFixtureValidator);
await repository.saveSession(fixturePresentation.session);
const mode = new URL(location.href).searchParams.get('mode') === '15s' ? '15s' : 'untimed';
const audibleWarnings = new URL(location.href).searchParams.get('audio') === '1';
const controller = new TimerController(repository);
function Harness() {
  const [generation, setGeneration] = useState(0), [history, setHistory] = useState(false), [saved, setSaved] = useState(0);
  return <div className="workspace">
    <header className="toolbar"><strong>TEST ONLY timer fixture</strong><label>Isolated input<input aria-label="Isolated input" /></label><button onClick={() => {
      if (!controller.blocked) { enterActivity(history ? 'idle' : 'editing'); setHistory(!history); }
    }}>Toggle history</button></header>
    <aside className="session-dock"><p>{saved} acknowledged saves</p></aside>
    <main className="practice">{history ? <AttemptHistory repository={repository} sessionId={fixturePresentation.session.id} /> : <TimerPractice key={generation} controller={controller}
      presentation={{ ...fixturePresentation, settings: { inspectionMode: mode, audibleWarnings } }} onSaved={() => setSaved((n) => n + 1)} onNext={() => setGeneration((n) => n + 1)} />}</main>
    <footer className="session-shelf">Test fixture only</footer>
  </div>;
}
const root = document.getElementById('root'); if (!root) throw new Error('Missing test root'); createRoot(root).render(<Harness />);
export const timerHarness = { controller, repository, state: activityStore.getState, lockUpdate, releaseUpdate };
declare global { interface Window { timerHarness: typeof timerHarness } }
window.timerHarness = timerHarness;
