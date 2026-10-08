import { createRoot } from 'react-dom/client';
import { useEffect, useMemo, useState } from 'react';

/** A generic stand-in for a design-team prototype: invented company, invented data, no real product anywhere. */
const THREAD = 'https://github.com/noahshrader-flock/prototype-pages-sandbox/issues/1';

type View = 'default' | 'empty' | 'loading';

const TEAMS = [
  { name: 'Platform', people: 14, active: 0.81 },
  { name: 'Design', people: 9, active: 0.67 },
  { name: 'Support', people: 22, active: 0.54 },
  { name: 'Finance', people: 6, active: 0.31 },
  { name: 'Legacy tools', people: 3, active: 0.04 },
];

const series = (seed: number, level: number) =>
  Array.from({ length: 60 }, (_, i) => Math.max(0.02, Math.min(1, level + Math.sin(i / 3 + seed) * 0.18 + Math.cos(i * 1.7 + seed) * 0.07)));

const Spark = ({ values }: { values: number[] }) => {
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 240},${60 - v * 56}`).join(' ');
  return (
    <svg viewBox="0 0 240 64" width="100%" height="64" role="img" aria-label="Daily activity, last 60 days">
      <polyline points={pts} fill="none" stroke="#3b6ea8" strokeWidth="2" />
    </svg>
  );
};

const App = () => {
  const [view, setView] = useState<View>('default');
  const [open, setOpen] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (view !== 'loading') return;
    const t = setTimeout(() => setTick((n) => n + 1), 1800);
    return () => clearTimeout(t);
  }, [view]);
  const charts = useMemo(() => TEAMS.map((t, i) => ({ ...t, values: series(i * 2.3, t.active) })), []);
  const selected = charts.find((c) => c.name === open) ?? null;

  return (
    <div className="page">
      <header className="top">
        <strong>Acme Console</strong>
        <nav>
          <span>Overview</span>
          <span className="on">Team usage</span>
          <span>Billing</span>
          <span>Settings</span>
        </nav>
        <span className="who">Sample Admin</span>
      </header>

      <div className="banner">
        This is a sandbox prototype with invented data, made to test publishing and commenting.{' '}
        <a href={THREAD} target="_blank" rel="noreferrer">Comment on this prototype (GitHub)</a>
      </div>

      <main>
        <h1>Team usage</h1>
        <p className="lede">How active each team has been over the last 60 days, so you can decide which tools to retire.</p>

        {view === 'loading' && tick === 0 && <p className="muted">Loading…</p>}
        {view === 'empty' && <p className="muted">No activity yet. Teams appear here once they sign in.</p>}
        {(view === 'default' || (view === 'loading' && tick > 0)) && (
          <>
            <h2>Least used</h2>
            <table>
              <thead>
                <tr><th>Team</th><th>People</th><th>Daily active</th><th></th></tr>
              </thead>
              <tbody>
                {[...charts].sort((a, b) => a.active - b.active).slice(0, 3).map((t) => (
                  <tr key={t.name}>
                    <td><button className="link" onClick={() => setOpen(t.name)}>{t.name}</button></td>
                    <td>{t.people}</td>
                    <td>{Math.round(t.active * 100)}%</td>
                    <td><button className="ghost" onClick={() => setOpen(t.name)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>Activity by team</h2>
            <div className="grid">
              {charts.map((t) => (
                <button key={t.name} className="card" onClick={() => setOpen(t.name)}>
                  <strong>{t.name}</strong>
                  <span className="muted">{t.people} people</span>
                  <Spark values={t.values} />
                  <span className="muted">Average {Math.round(t.active * 100)}% active daily</span>
                </button>
              ))}
            </div>
          </>
        )}
      </main>

      {selected && (
        <aside className="drawer" aria-label={`${selected.name} details`}>
          <button className="ghost" onClick={() => setOpen(null)}>Close</button>
          <h2>{selected.name}</h2>
          <p className="muted">{selected.people} people, {Math.round(selected.active * 100)}% active on an average day.</p>
          <Spark values={selected.values} />
        </aside>
      )}

      <footer className="states" role="group" aria-label="Prototype state">
        <span>State</span>
        {(['default', 'empty', 'loading'] as View[]).map((v) => (
          <button key={v} className={view === v ? 'on' : ''} onClick={() => { setView(v); setTick(0); setOpen(null); }}>{v}</button>
        ))}
      </footer>
    </div>
  );
};

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
