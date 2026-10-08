// Proof that a comment made in the browser is the comment the app reads: the app's own reader and its comments.md writer.
import { renderComments } from '@app/main/services/commentsExport';
import { isResolved, parseAnchor, parsePicture, stripAnchor } from '@app/shared/anchor';
import type { ReviewComment } from '@app/shared/contract';

const raw = (await (await fetch('https://api.github.com/repos/noahshrader-flock/prototype-pages-sandbox/issues/1/comments?per_page=100')).json()) as Record<string, any>[];
const comments: ReviewComment[] = raw.map((c) => ({
	id: c.id, author: c.user.login, authorAvatarUrl: null, createdAt: c.created_at, addressedAt: null,
	body: stripAnchor(String(c.body).replace('<!-- resolved -->', '').trim()), resolved: isResolved(c.body), anchor: parseAnchor(c.body), picture: parsePicture(c.body),
}));
const out = renderComments({ projectId: 'sandbox', title: 'Team usage prototype', iteration: { name: 'i1', branch: 'prototype/sandbox/i1' }, comments, generatedAt: new Date('2026-10-07T12:00:00Z') });
console.log(out.markdown);
