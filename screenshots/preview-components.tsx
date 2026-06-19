/**
 * Self-contained preview components for screenshots.
 * UI structure mirrors entrypoints/popup/App.tsx and deepseek.content.tsx 1:1,
 * CSS is imported from the real source files so the look is pixel-accurate.
 */
import { useMemo, useState } from 'react';
import type {
  AppState,
  ChatMessage,
  VisualEffect,
} from '../src/types';

/* ---------- popup ---------- */

export function PopupPreview({ state }: { state: AppState }) {
  return (
    <main className="popup-shell">
      <header>
        <span className="popup-mark">deepseek-plugin</span>
        <h1>DeepSeek 助手</h1>
        <p>在 chat.deepseek.com 页面使用小鲸鱼入口。</p>
      </header>

      <section className="popup-status" aria-label="Plugin status">
        <StatusItem label="提示词" value={state.prompts.length.toString()} />
        <StatusItem label="文件夹" value={state.folders.length.toString()} />
        <StatusItem label="收藏会话" value={state.savedChats.length.toString()} />
      </section>

      <section className="popup-controls" aria-label="Plugin controls">
        <button type="button">
          页面面板：{state.settings.panelEnabled ? '开启' : '关闭'}
        </button>
        <label>
          视觉效果
          <select value={state.settings.visualEffect}>
            <option value="off">关闭</option>
            <option value="snow">雪</option>
            <option value="sakura">樱花</option>
            <option value="rain">雨</option>
          </select>
        </label>
      </section>
    </main>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

/* ---------- page panel ---------- */

type Tab = 'timeline' | 'prompts' | 'library' | 'effects';

export function PanelPreview({
  state,
  messages,
  tab,
}: {
  state: AppState;
  messages: ChatMessage[];
  tab: Tab;
}) {
  return (
    <>
      <section className="dsp-panel" aria-label="DeepSeek plugin panel">
        <header className="dsp-header">
          <div>
            <p className="dsp-kicker">deepseek-plugin</p>
            <h1>DeepSeek 助手</h1>
          </div>
          <button className="dsp-icon-button" type="button" aria-label="Close panel">
            x
          </button>
        </header>

        <nav className="dsp-tabs" aria-label="Plugin features">
          <TabButton active={tab === 'timeline'} label="时间线" />
          <TabButton active={tab === 'prompts'} label="提示词" />
          <TabButton active={tab === 'library'} label="整理" />
          <TabButton active={tab === 'effects'} label="效果" />
        </nav>

        {tab === 'timeline' ? <TimelineTab messages={messages} /> : null}
        {tab === 'prompts' ? <PromptsTab prompts={state.prompts} /> : null}
        {tab === 'library' ? (
          <LibraryTab folders={state.folders} savedChats={state.savedChats} messages={messages} />
        ) : null}
        {tab === 'effects' ? <EffectsTab settings={state.settings} /> : null}
      </section>
    </>
  );
}

export function LauncherPreview() {
  return (
    <div className="dsp-shell">
      <button className="dsp-launcher" type="button" aria-label="Open DeepSeek plugin">
        <WhaleIcon />
      </button>
    </div>
  );
}

export function EffectLayerPreview({ effect }: { effect: VisualEffect }) {
  if (effect === 'off') return null;
  return (
    <div className={`dsp-effect-layer dsp-effect-layer-${effect}`} aria-hidden>
      {Array.from({ length: effect === 'rain' ? 42 : 28 }, (_, index) => (
        <span key={index} style={{ '--i': index } as React.CSSProperties} />
      ))}
    </div>
  );
}

function TabButton({ active, label }: { active: boolean; label: string }) {
  return (
    <button className={active ? 'dsp-tab dsp-tab-active' : 'dsp-tab'} type="button">
      {label}
    </button>
  );
}

function TimelineTab({ messages }: { messages: ChatMessage[] }) {
  const snapshot = { title: '', url: '', exportedAt: '', messages } as never;
  void snapshot;
  return (
    <div className="dsp-section">
      <div className="dsp-toolbar">
        <span>{messages.length} 条当前消息</span>
        <div className="dsp-actions">
          <button type="button">刷新</button>
          <button type="button">导出 MD</button>
          <button type="button">导出 JSON</button>
        </div>
      </div>

      {messages.length > 0 ? (
        <ol className="dsp-timeline">
          {messages.map((message) => (
            <li key={message.id}>
              <button type="button">
                <span className="dsp-node-index">{message.index}</span>
                <span>
                  <strong>{formatRole(message.role)}</strong>
                  <small>{message.text.slice(0, 90)}</small>
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState text="当前页面还没有识别到聊天消息。" />
      )}
    </div>
  );
}

function PromptsTab({
  prompts,
}: {
  prompts: AppState['prompts'];
}) {
  return (
    <div className="dsp-section">
      <div className="dsp-form">
        <input placeholder="标题" defaultValue="" />
        <textarea placeholder="提示词内容" defaultValue="" />
        <input placeholder="标签，用逗号分隔" defaultValue="" />
        <div className="dsp-actions">
          <button type="button">新建提示词</button>
        </div>
      </div>

      {prompts.length > 0 ? (
        <div className="dsp-list">
          {prompts.map((prompt) => (
            <article className="dsp-card" key={prompt.id}>
              <h2>{prompt.title}</h2>
              <p>{prompt.content}</p>
              <TagList tags={prompt.tags} />
              <div className="dsp-actions">
                <button type="button">复制</button>
                <button type="button">编辑</button>
                <button type="button">删除</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState text="还没有保存提示词。" />
      )}
    </div>
  );
}

function LibraryTab({
  folders,
  savedChats,
  messages,
}: {
  folders: AppState['folders'];
  savedChats: AppState['savedChats'];
  messages: ChatMessage[];
}) {
  const folderName = (id: string | null) =>
    !id ? '' : folders.find((f) => f.id === id)?.name ?? '';
  return (
    <div className="dsp-section">
      <div className="dsp-form dsp-compact-form">
        <input placeholder="新文件夹名称" defaultValue="" />
        <button type="button">新建文件夹</button>
      </div>

      <div className="dsp-form">
        <select defaultValue="">
          <option value="">不选择文件夹</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
        <input placeholder="当前会话标签，用逗号分隔" defaultValue="" />
        <button type="button">保存当前会话</button>
      </div>

      {savedChats.length > 0 ? (
        <div className="dsp-list">
          {savedChats.map((chat) => (
            <article className="dsp-card" key={chat.id}>
              <h2>{chat.title}</h2>
              <p>{chat.preview || '无预览内容'}</p>
              <TagList
                tags={[folderName(chat.folderId), ...chat.tags].filter(Boolean)}
              />
              <div className="dsp-actions">
                <button type="button">打开</button>
                <button type="button">删除</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState text="还没有收藏会话。" />
      )}

      <div className="dsp-meta">{messages.length} 条当前消息可用于保存预览。</div>
    </div>
  );
}

function EffectsTab({ settings }: { settings: AppState['settings'] }) {
  const effects: VisualEffect[] = ['off', 'snow', 'sakura', 'rain'];
  return (
    <div className="dsp-section">
      <div className="dsp-switch-row">
        <span>页面面板</span>
        <button type="button">
          {settings.panelEnabled ? '已开启' : '已关闭'}
        </button>
      </div>

      <div className="dsp-effect-grid">
        {effects.map((effect) => (
          <button
            className={
              settings.visualEffect === effect
                ? 'dsp-effect dsp-effect-active'
                : 'dsp-effect'
            }
            key={effect}
            type="button"
          >
            {formatEffect(effect)}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="dsp-empty">{text}</p>;
}

function TagList({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="dsp-tags">
      {tags.map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  );
}

function WhaleIcon() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-hidden>
      <path
        d="M11 34c0-10 8-18 20-18 9 0 15 4 19 10 2-4 5-7 10-8-1 8-5 13-11 15v2c0 9-7 16-18 16H18c-6 0-10-5-10-10 0-3 1-5 3-7Z"
        fill="currentColor"
      />
      <path
        d="M13 34c4 4 10 6 18 6 7 0 13-2 17-5"
        fill="none"
        stroke="#ffffff"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <circle cx="25" cy="27" r="2.6" fill="#ffffff" />
      <path d="M7 31c-3-2-5-5-5-9 6 1 10 4 12 8" fill="currentColor" />
    </svg>
  );
}

function formatRole(role: ChatMessage['role']) {
  if (role === 'user') return 'User';
  if (role === 'assistant') return 'Assistant';
  if (role === 'system') return 'System';
  return 'Message';
}

function formatEffect(effect: VisualEffect) {
  if (effect === 'off') return '关闭';
  if (effect === 'snow') return '雪';
  if (effect === 'sakura') return '樱花';
  return '雨';
}
