import type { ChatSnapshot } from '../types';

export function exportSnapshot(snapshot: ChatSnapshot, format: 'markdown' | 'json') {
  const content =
    format === 'markdown'
      ? snapshotToMarkdown(snapshot)
      : JSON.stringify(snapshot, null, 2);
  const mime = format === 'markdown' ? 'text/markdown' : 'application/json';
  const extension = format === 'markdown' ? 'md' : 'json';
  downloadTextFile(content, `${slugify(snapshot.title)}.${extension}`, mime);
}

export function snapshotToMarkdown(snapshot: ChatSnapshot) {
  const lines = [
    `# ${snapshot.title}`,
    '',
    `- URL: ${snapshot.url}`,
    `- Exported: ${snapshot.exportedAt}`,
    '',
  ];

  for (const message of snapshot.messages) {
    lines.push(`## ${message.index}. ${formatRole(message.role)}`);
    lines.push('');
    lines.push(message.text || '_No text content captured._');
    lines.push('');
  }

  return lines.join('\n');
}

function downloadTextFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function formatRole(role: string) {
  if (role === 'user') return 'User';
  if (role === 'assistant') return 'Assistant';
  if (role === 'system') return 'System';
  return 'Message';
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'deepseek-chat'
  );
}
