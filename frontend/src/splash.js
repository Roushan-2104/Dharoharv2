import API_BASE_URL from './config/api';

// The opening screen lives in index.html so it shows before the app's JavaScript arrives.
// It stays until the backend answers its health check and the page reports its parts are ready
// (on the home page: the heritage records and the globe), then fades away. If the server is slow,
// a note and a "Continue anyway" button appear so nobody is stuck on it.
const MIN_VISIBLE_MS = 2600; // long enough for the name to fade in and settle
const SLOW_AFTER_MS = 12000;
const RETRY_MS = 1500;
const PARTS_CAP_MS = 10000; // after the backend answers, never wait longer than this for the page

// Parts of the page still loading; pages call markReady(part) as each one arrives
const pending = new Set();
let onPartReady = () => {};
export function markReady(part) {
  if (pending.delete(part)) onPartReady();
}

export function startSplash() {
  const el = document.getElementById('splash');
  if (!el) return;

  let done = false;
  const hide = () => {
    if (done) return;
    done = true;
    el.classList.add('splash-out');
    const remove = () => el.remove();
    el.addEventListener('transitionend', remove, { once: true });
    setTimeout(remove, 800); // in case the transition never runs (reduced motion)
  };

  // performance.now() counts from page load, so the minimum covers the whole opening
  // ...and the progress rule gets a moment to glide to the end before the screen fades
  const finish = () => setTimeout(hide, Math.max(800, MIN_VISIBLE_MS - performance.now()));

  // The home page waits for its records and the globe; other pages only for the backend
  if (window.location.pathname === '/') ['data', 'globe'].forEach(p => pending.add(p));
  let backendUp = false;
  const home = pending.size > 0;

  // Name the current stage (server, then records, then globe) and give the progress rule a span
  // of its own for each one. Within a stage the rule creeps on, slowing as it nears the end of
  // the span, so it never looks stuck and never runs ahead of what has really loaded.
  const bar = el.querySelector('[data-bar]');
  const stage = el.querySelector('[data-stage]');
  const step = el.querySelector('[data-step]');
  let span = [0.04, 0.3];
  let shown = 0.04;
  const show = (label, n, total, from, to) => {
    if (stage) stage.textContent = label;
    if (step) step.textContent = n <= total ? `${n} of ${total}` : '';
    span = [from, to];
  };
  const render = () => {
    if (!backendUp) return show('Waking the server', 1, home ? 3 : 1, 0.04, home ? 0.3 : 0.9);
    if (pending.has('data')) return show('Gathering the heritage records', 2, 3, 0.33, 0.62);
    if (pending.has('globe')) return show('Drawing the globe', 3, 3, 0.66, 0.92);
    show('Ready', 99, 0, 1, 1);
  };
  render();
  const creep = setInterval(() => {
    if (!el.isConnected) return clearInterval(creep);
    shown = Math.max(shown, span[0]);
    shown += (span[1] - shown) * 0.08;
    if (bar) bar.style.transform = `scaleX(${shown.toFixed(3)})`;
  }, 250);

  const maybeFinish = () => { render(); if (backendUp && pending.size === 0) finish(); };
  onPartReady = maybeFinish;

  const check = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`, { cache: 'no-store' });
      if (res.ok) {
        backendUp = true;
        setTimeout(() => { pending.clear(); maybeFinish(); }, PARTS_CAP_MS);
        return maybeFinish();
      }
    } catch {
      // backend not up yet
    }
    if (!done) setTimeout(check, RETRY_MS);
  };
  check();

  setTimeout(() => {
    if (done) return;
    el.querySelectorAll('[data-slow]').forEach(n => n.removeAttribute('hidden'));
  }, SLOW_AFTER_MS);
  el.querySelector('[data-continue]')?.addEventListener('click', hide);
}
