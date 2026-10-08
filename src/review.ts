/**
 * Comments on a published prototype, from the browser.
 *
 * The pick tool, the pins and the comment format are the app's own code (pageScripts, anchor, comments), so a
 * comment made here is the same comment the app reads: same anchor, same body, same thread.
 *
 * Signing in is the one part a static page cannot do for itself: GitHub's sign-in endpoints refuse browser requests,
 * and its API accepts them only with a token. For this test the token is pasted in and kept in the browser; a real
 * version would get it from a small extension or a sign-in service.
 */
import { PICK_SCRIPT, CANCEL_PICK_SCRIPT, MESSAGE_PREFIX, focusScript, resolveScript } from '@app/main/services/pageScripts';
import { composeBody, isResolved, parseAnchor, parsePicture, sanitizeAnchor, stripAnchor } from '@app/shared/anchor';
import { markersFor, numberComments, openComments } from '@app/shared/comments';
import type { CommentAnchor, ReviewComment } from '@app/shared/contract';

const REPO = 'noahshrader-flock/prototype-pages-sandbox';
const THREAD = 1;
const API = `https://api.github.com/repos/${REPO}/issues/${THREAD}/comments`;
const KEY = 'fd-token';
const BUILD = 'sandbox';
const run = (code: string): unknown => (0, eval)(code);

let comments: ReviewComment[] = [];
let panelOpen = false;
let selected: number | null = null;
let me: string | null = null;

const token = (): string | null => localStorage.getItem(KEY);
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, css: string, text?: string): HTMLElementTagNameMap[K] => {
	const e = document.createElement(tag);
	e.style.cssText = css;
	if (text !== undefined) e.textContent = text;
	return e;
};
const BTN = 'font:600 13px system-ui;border:1px solid #1d3557;background:#1d3557;color:#fff;border-radius:8px;padding:8px 12px;cursor:pointer';
const GHOST = 'font:13px system-ui;border:1px solid #c8d1de;background:#fff;color:#1c2430;border-radius:8px;padding:8px 12px;cursor:pointer';

const toComment = (raw: Record<string, any>): ReviewComment => {
	const body = String(raw.body ?? '');
	return {
		id: Number(raw.id),
		author: String(raw.user?.login ?? 'unknown'),
		authorAvatarUrl: raw.user?.avatar_url ?? null,
		body: stripAnchor(body.replace('<!-- resolved -->', '').trim()),
		createdAt: String(raw.created_at ?? ''),
		resolved: isResolved(body),
		addressedAt: null,
		anchor: parseAnchor(body),
		picture: parsePicture(body),
	};
};

const load = async (): Promise<void> => {
	const res = await fetch(`${API}?per_page=100`, { headers: token() ? { Authorization: `Bearer ${token()}` } : {} });
	if (res.ok) comments = ((await res.json()) as Record<string, any>[]).map(toComment);
	draw();
	render();
};

/** The pins: the app's own, drawn from the same comments, numbered the same way. */
const draw = (): void => {
	const items = markersFor(comments, numberComments(comments), me, null);
	run(resolveScript(items, 'sandbox'));
};

// A pin that is clicked says so through the console, as it does inside the app.
const debug = console.debug.bind(console);
console.debug = (...args: unknown[]) => {
	const first = args[0];
	if (typeof first === 'string' && first.startsWith(MESSAGE_PREFIX)) {
		try {
			const m = JSON.parse(first.slice(MESSAGE_PREFIX.length)) as { t?: string; id?: number };
			if (m.t === 'click' && typeof m.id === 'number') {
				selected = m.id;
				panelOpen = true;
				render();
			}
		} catch {
			// Not ours.
		}
		return;
	}
	debug(...args);
};

const bar = el('div', 'position:fixed;right:16px;bottom:16px;z-index:2147483600;display:flex;gap:8px;align-items:flex-start;font:13px system-ui');
const panel = el('div', 'position:fixed;right:16px;bottom:64px;width:340px;max-height:60vh;overflow:auto;z-index:2147483600;background:#fff;border:1px solid #c8d1de;border-radius:12px;box-shadow:0 12px 32px rgba(20,30,50,.18);padding:14px;font:13px system-ui;color:#1c2430;display:none');
document.body.append(panel, bar);

const signIn = (): void => {
	const t = window.prompt('Paste a GitHub token with Issues write access to this sandbox repository (test only; it stays in this browser).');
	if (t && t.trim()) {
		localStorage.setItem(KEY, t.trim());
		void whoAmI().then(render);
	}
};

const whoAmI = async (): Promise<void> => {
	if (!token()) return void (me = null);
	const res = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${token()}` } });
	me = res.ok ? String(((await res.json()) as { login?: string }).login ?? '') || null : null;
};

const post = async (text: string, anchor: CommentAnchor): Promise<string | null> => {
	const res = await fetch(API, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' },
		body: JSON.stringify({ body: composeBody(text, anchor, null) }),
	});
	if (res.ok) return null;
	return res.status === 401 || res.status === 403 || res.status === 404 ? 'GitHub did not accept the token. Use a token with Issues write access to this repository.' : `GitHub returned ${res.status}.`;
};

const compose = (anchor: CommentAnchor, at: { x: number; y: number }): void => {
	const box = el('div', `position:fixed;left:${Math.min(at.x + 18, window.innerWidth - 320)}px;top:${Math.min(at.y + 10, window.innerHeight - 220)}px;width:300px;z-index:2147483601;background:#fff;border:1px solid #c8d1de;border-radius:12px;box-shadow:0 12px 32px rgba(20,30,50,.22);padding:12px;font:13px system-ui;color:#1c2430`);
	const error = el('div', 'color:#b3261e;margin-bottom:6px;display:none');
	const label = el('div', 'color:#5b6677;margin-bottom:6px', `On: ${anchor.tag ?? 'element'}${anchor.nearbyText ? ` “${anchor.nearbyText.slice(0, 40)}”` : ''}`);
	const area = el('textarea', 'width:100%;box-sizing:border-box;height:80px;border:1px solid #c8d1de;border-radius:8px;padding:8px;font:13px system-ui');
	const row = el('div', 'display:flex;gap:8px;justify-content:flex-end;margin-top:8px');
	const cancel = el('button', GHOST, 'Cancel');
	const save = el('button', BTN, 'Save');
	cancel.onclick = () => box.remove();
	save.onclick = async () => {
		if (!area.value.trim()) return;
		save.disabled = true;
		const problem = await post(area.value.trim(), anchor);
		if (problem) {
			error.textContent = problem;
			error.style.display = 'block';
			save.disabled = false;
			return;
		}
		box.remove();
		await load();
	};
	row.append(cancel, save);
	box.append(error, label, area, row);
	document.body.append(box);
	area.focus();
};

const startComment = async (): Promise<void> => {
	if (!token()) return signIn();
	panelOpen = false;
	render();
	const raw = (await run(PICK_SCRIPT)) as (Record<string, unknown> & { at?: { x: number; y: number } }) | null;
	if (!raw) return;
	const anchor = sanitizeAnchor({ ...raw, commit: BUILD === 'sandbox' ? '' : BUILD });
	if (anchor) compose(anchor, raw.at ?? { x: 100, y: 100 });
};

const render = (): void => {
	bar.replaceChildren();
	const n = openComments(comments).length;
	const add = el('button', BTN, 'Comment');
	add.onclick = () => void startComment();
	const list = el('button', GHOST, `Comments (${n})`);
	list.onclick = () => {
		panelOpen = !panelOpen;
		render();
	};
	const who = el('button', GHOST, token() ? (me ? `Signed in as ${me}` : 'Token set') : 'Sign in');
	who.onclick = signIn;
	bar.append(add, list, who);

	panel.style.display = panelOpen ? 'block' : 'none';
	panel.replaceChildren();
	if (!panelOpen) return;
	panel.append(el('div', 'font-weight:700;margin-bottom:8px', 'Comments'));
	if (comments.length === 0) panel.append(el('div', 'color:#5b6677', 'No comments yet. Choose Comment, then click anything on the page.'));
	const numbers = numberComments(comments);
	for (const c of comments) {
		const row = el('div', `border:1px solid ${selected === c.id ? '#1d3557' : '#e1e6ee'};border-radius:10px;padding:10px;margin-bottom:8px;cursor:pointer`);
		row.append(el('div', 'font-weight:600;margin-bottom:4px', `${numbers.get(c.id) ? `${numbers.get(c.id)}  ·  ` : ''}${c.author}`), el('div', '', c.body));
		if (c.anchor) row.append(el('div', 'color:#5b6677;margin-top:4px;font-size:12px', `${c.anchor.tag ?? 'element'}${c.anchor.inside?.length ? ` in ${c.anchor.inside.join(' › ')}` : ''}`));
		row.onclick = () => {
			selected = c.id;
			if (c.anchor) run(focusScript(c.id));
			render();
		};
		panel.append(row);
	}
};

// React mounts first; pins are drawn once there is something to attach them to.
window.addEventListener('load', () => {
	setTimeout(() => void whoAmI().then(load), 600);
	setInterval(() => void load(), 30_000);
});
window.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') run(CANCEL_PICK_SCRIPT);
});
render();
