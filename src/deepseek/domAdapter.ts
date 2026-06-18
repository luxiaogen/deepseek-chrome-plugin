import type { ChatMessage, ChatSnapshot } from '../types';

const MESSAGE_SELECTORS = [
  '[data-message-author-role]',
  '[data-testid*="conversation-turn"]',
  'article',
  '.ds-markdown',
  '[class*="message"]',
  '[class*="Message"]',
];

export function getCurrentChatSnapshot(): ChatSnapshot {
  const messages = getCurrentChatMessages();

  return {
    title: getChatTitle(messages),
    url: location.href,
    exportedAt: new Date().toISOString(),
    messages,
  };
}

export function getCurrentChatMessages(): ChatMessage[] {
  const elements = findMessageElements();

  return elements.map((element, index) => {
    const id = ensureMessageId(element, index);
    return {
      id,
      index: index + 1,
      role: detectRole(element),
      text: normalizeText(element.textContent ?? ''),
    };
  });
}

export function scrollToMessage(id: string) {
  const element = document.querySelector<HTMLElement>(
    `[data-deepseek-plugin-message-id="${CSS.escape(id)}"]`,
  );
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function findMessageElements() {
  const candidates = MESSAGE_SELECTORS.flatMap((selector) =>
    Array.from(document.querySelectorAll<HTMLElement>(selector)),
  );
  const unique = Array.from(new Set(candidates));
  const visible = unique.filter(isLikelyMessageElement);

  return removeNestedDuplicates(visible).slice(0, 200);
}

function isLikelyMessageElement(element: HTMLElement) {
  if (!isVisible(element)) return false;

  const text = normalizeText(element.textContent ?? '');
  if (text.length < 2) return false;
  if (text.length > 20000) return false;

  const role = element.getAttribute('data-message-author-role');
  if (role) return true;

  const className = element.className.toString().toLowerCase();
  if (className.includes('markdown')) return true;
  if (className.includes('message')) return true;
  if (element.tagName.toLowerCase() === 'article') return true;

  return false;
}

function removeNestedDuplicates(elements: HTMLElement[]) {
  return elements.filter((element) => {
    const containsAnotherCandidate = elements.some(
      (candidate) => candidate !== element && element.contains(candidate),
    );
    const parentIsCandidate = elements.some(
      (candidate) => candidate !== element && candidate.contains(element),
    );

    if (element.matches('.ds-markdown')) return true;
    return !containsAnotherCandidate || !parentIsCandidate;
  });
}

function ensureMessageId(element: HTMLElement, index: number) {
  const existing = element.dataset.deepseekPluginMessageId;
  if (existing) return existing;

  const id = `message-${index + 1}`;
  element.dataset.deepseekPluginMessageId = id;
  return id;
}

function detectRole(element: HTMLElement): ChatMessage['role'] {
  const explicitRole = element.getAttribute('data-message-author-role');
  if (explicitRole === 'user' || explicitRole === 'assistant') {
    return explicitRole;
  }

  const text = [
    element.getAttribute('aria-label'),
    element.className.toString(),
    element.closest('[data-message-author-role]')?.getAttribute(
      'data-message-author-role',
    ),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (text.includes('user') || text.includes('human')) return 'user';
  if (text.includes('assistant') || text.includes('ai')) return 'assistant';
  if (text.includes('system')) return 'system';
  return 'unknown';
}

function getChatTitle(messages: ChatMessage[]) {
  const title = document.title.replace(/\s*-\s*DeepSeek.*$/i, '').trim();
  if (title && title.toLowerCase() !== 'deepseek') return title;

  const firstUserMessage = messages.find((message) => message.role === 'user');
  return firstUserMessage?.text.slice(0, 60) || 'DeepSeek Chat';
}

function normalizeText(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function isVisible(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.visibility !== 'hidden' &&
    style.display !== 'none'
  );
}
