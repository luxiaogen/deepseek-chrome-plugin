import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './deepseek-panel.css';
import {
  createId,
  getAppState,
  setFolders,
  setPrompts,
  setSavedChats,
  setSettings,
} from '@/src/storage';
import {
  getCurrentChatMessages,
  getCurrentChatSnapshot,
  scrollToMessage,
} from '@/src/deepseek/domAdapter';
import { exportSnapshot } from '@/src/deepseek/export';
import type {
  AppState,
  ChatMessage,
  Folder,
  Prompt,
  SavedChat,
  Settings,
  VisualEffect,
} from '@/src/types';

type Tab = 'timeline' | 'prompts' | 'library' | 'effects';

const DEFAULT_FOLDER_COLOR = '#2563eb';

export default defineContentScript({
  matches: ['https://chat.deepseek.com/*'],
  cssInjectionMode: 'ui',
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'deepseek-plugin',
      position: 'overlay',
      anchor: 'body',
      onMount(container) {
        const wrapper = document.createElement('div');
        container.append(wrapper);

        const root = ReactDOM.createRoot(wrapper);
        root.render(<DeepSeekPanel />);
        return root;
      },
      onRemove(root) {
        root?.unmount();
      },
    });

    ui.mount();
  },
});

function DeepSeekPanel() {
  const [state, setState] = useState<AppState | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('timeline');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    void loadState();
    refreshMessages();
  }, []);

  async function loadState() {
    setState(await getAppState());
  }

  function refreshMessages() {
    setMessages(getCurrentChatMessages());
  }

  if (!state) {
    return null;
  }

  if (!state.settings.panelEnabled) {
    return <VisualEffectLayer effect={state.settings.visualEffect} />;
  }

  return (
    <>
      <VisualEffectLayer effect={state.settings.visualEffect} />
      <div className="dsp-shell">
        <button
          className="dsp-launcher"
          type="button"
          aria-label="Open DeepSeek plugin"
          onClick={() => {
            refreshMessages();
            setIsOpen((value) => !value);
          }}
        >
          <WhaleIcon />
        </button>

        {isOpen ? (
          <section className="dsp-panel" aria-label="DeepSeek plugin panel">
            <header className="dsp-header">
              <div>
                <p className="dsp-kicker">deepseek-plugin</p>
                <h1>DeepSeek 助手</h1>
              </div>
              <button
                className="dsp-icon-button"
                type="button"
                aria-label="Close panel"
                onClick={() => setIsOpen(false)}
              >
                x
              </button>
            </header>

            <nav className="dsp-tabs" aria-label="Plugin features">
              <TabButton
                active={activeTab === 'timeline'}
                label="时间线"
                onClick={() => {
                  refreshMessages();
                  setActiveTab('timeline');
                }}
              />
              <TabButton
                active={activeTab === 'prompts'}
                label="提示词"
                onClick={() => setActiveTab('prompts')}
              />
              <TabButton
                active={activeTab === 'library'}
                label="整理"
                onClick={() => setActiveTab('library')}
              />
              <TabButton
                active={activeTab === 'effects'}
                label="效果"
                onClick={() => setActiveTab('effects')}
              />
            </nav>

            {activeTab === 'timeline' ? (
              <TimelineTab messages={messages} onRefresh={refreshMessages} />
            ) : null}
            {activeTab === 'prompts' ? (
              <PromptsTab
                prompts={state.prompts}
                onChange={async (prompts) => {
                  await setPrompts(prompts);
                  setState({ ...state, prompts });
                }}
              />
            ) : null}
            {activeTab === 'library' ? (
              <LibraryTab
                folders={state.folders}
                savedChats={state.savedChats}
                messages={messages}
                onRefreshMessages={refreshMessages}
                onFoldersChange={async (folders) => {
                  await setFolders(folders);
                  setState({ ...state, folders });
                }}
                onSavedChatsChange={async (savedChats) => {
                  await setSavedChats(savedChats);
                  setState({ ...state, savedChats });
                }}
              />
            ) : null}
            {activeTab === 'effects' ? (
              <EffectsTab
                settings={state.settings}
                onChange={async (settings) => {
                  await setSettings(settings);
                  setState({ ...state, settings });
                }}
              />
            ) : null}
          </section>
        ) : null}
      </div>
    </>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={active ? 'dsp-tab dsp-tab-active' : 'dsp-tab'}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function TimelineTab({
  messages,
  onRefresh,
}: {
  messages: ChatMessage[];
  onRefresh: () => void;
}) {
  const snapshot = useMemo(() => getCurrentChatSnapshot(), [messages]);

  return (
    <div className="dsp-section">
      <div className="dsp-toolbar">
        <span>{messages.length} 条当前消息</span>
        <div className="dsp-actions">
          <button type="button" onClick={onRefresh}>
            刷新
          </button>
          <button type="button" onClick={() => exportSnapshot(snapshot, 'markdown')}>
            导出 MD
          </button>
          <button type="button" onClick={() => exportSnapshot(snapshot, 'json')}>
            导出 JSON
          </button>
        </div>
      </div>

      {messages.length > 0 ? (
        <ol className="dsp-timeline">
          {messages.map((message) => (
            <li key={message.id}>
              <button type="button" onClick={() => scrollToMessage(message.id)}>
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
  onChange,
}: {
  prompts: Prompt[];
  onChange: (prompts: Prompt[]) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setContent('');
    setTags('');
  }

  async function savePrompt() {
    if (!title.trim() || !content.trim()) return;

    const now = new Date().toISOString();
    const nextPrompt: Prompt = {
      id: editingId ?? createId('prompt'),
      title: title.trim(),
      content: content.trim(),
      tags: parseTags(tags),
      createdAt:
        prompts.find((prompt) => prompt.id === editingId)?.createdAt ?? now,
      updatedAt: now,
    };

    const nextPrompts = editingId
      ? prompts.map((prompt) =>
          prompt.id === editingId ? nextPrompt : prompt,
        )
      : [nextPrompt, ...prompts];

    await onChange(nextPrompts);
    resetForm();
  }

  return (
    <div className="dsp-section">
      <div className="dsp-form">
        <input
          placeholder="标题"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <textarea
          placeholder="提示词内容"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <input
          placeholder="标签，用逗号分隔"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
        />
        <div className="dsp-actions">
          <button type="button" onClick={savePrompt}>
            {editingId ? '保存修改' : '新建提示词'}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm}>
              取消
            </button>
          ) : null}
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
                <button
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(prompt.content)}
                >
                  复制
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(prompt.id);
                    setTitle(prompt.title);
                    setContent(prompt.content);
                    setTags(prompt.tags.join(', '));
                  }}
                >
                  编辑
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void onChange(prompts.filter((item) => item.id !== prompt.id))
                  }
                >
                  删除
                </button>
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
  onRefreshMessages,
  onFoldersChange,
  onSavedChatsChange,
}: {
  folders: Folder[];
  savedChats: SavedChat[];
  messages: ChatMessage[];
  onRefreshMessages: () => void;
  onFoldersChange: (folders: Folder[]) => Promise<void>;
  onSavedChatsChange: (savedChats: SavedChat[]) => Promise<void>;
}) {
  const [folderName, setFolderName] = useState('');
  const [folderId, setFolderId] = useState(folders[0]?.id ?? '');
  const [chatTags, setChatTags] = useState('');

  async function addFolder() {
    if (!folderName.trim()) return;

    const now = new Date().toISOString();
    const folder: Folder = {
      id: createId('folder'),
      name: folderName.trim(),
      color: DEFAULT_FOLDER_COLOR,
      createdAt: now,
      updatedAt: now,
    };
    await onFoldersChange([folder, ...folders]);
    setFolderName('');
    setFolderId(folder.id);
  }

  async function saveCurrentChat() {
    onRefreshMessages();
    const snapshot = getCurrentChatSnapshot();
    const now = new Date().toISOString();
    const existing = savedChats.find((chat) => chat.url === snapshot.url);
    const savedChat: SavedChat = {
      id: existing?.id ?? createId('chat'),
      title: snapshot.title,
      url: snapshot.url,
      folderId: folderId || null,
      tags: parseTags(chatTags),
      preview: snapshot.messages[0]?.text.slice(0, 140) ?? '',
      savedAt: existing?.savedAt ?? now,
      updatedAt: now,
    };

    const nextSavedChats = existing
      ? savedChats.map((chat) => (chat.id === existing.id ? savedChat : chat))
      : [savedChat, ...savedChats];

    await onSavedChatsChange(nextSavedChats);
  }

  return (
    <div className="dsp-section">
      <div className="dsp-form dsp-compact-form">
        <input
          placeholder="新文件夹名称"
          value={folderName}
          onChange={(event) => setFolderName(event.target.value)}
        />
        <button type="button" onClick={addFolder}>
          新建文件夹
        </button>
      </div>

      <div className="dsp-form">
        <select
          value={folderId}
          onChange={(event) => setFolderId(event.target.value)}
        >
          <option value="">不选择文件夹</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
        <input
          placeholder="当前会话标签，用逗号分隔"
          value={chatTags}
          onChange={(event) => setChatTags(event.target.value)}
        />
        <button type="button" onClick={saveCurrentChat}>
          保存当前会话
        </button>
      </div>

      {savedChats.length > 0 ? (
        <div className="dsp-list">
          {savedChats.map((chat) => (
            <article className="dsp-card" key={chat.id}>
              <h2>{chat.title}</h2>
              <p>{chat.preview || '无预览内容'}</p>
              <TagList
                tags={[
                  folderNameForId(folders, chat.folderId),
                  ...chat.tags,
                ].filter(Boolean)}
              />
              <div className="dsp-actions">
                <button type="button" onClick={() => window.open(chat.url, '_blank')}>
                  打开
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void onSavedChatsChange(
                      savedChats.filter((item) => item.id !== chat.id),
                    )
                  }
                >
                  删除
                </button>
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

function EffectsTab({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (settings: Settings) => Promise<void>;
}) {
  const effects: VisualEffect[] = ['off', 'snow', 'sakura', 'rain'];

  return (
    <div className="dsp-section">
      <div className="dsp-switch-row">
        <span>页面面板</span>
        <button
          type="button"
          onClick={() =>
            void onChange({
              ...settings,
              panelEnabled: !settings.panelEnabled,
            })
          }
        >
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
            onClick={() => void onChange({ ...settings, visualEffect: effect })}
          >
            {formatEffect(effect)}
          </button>
        ))}
      </div>
    </div>
  );
}

function VisualEffectLayer({ effect }: { effect: VisualEffect }) {
  if (effect === 'off') return null;

  return (
    <div className={`dsp-effect-layer dsp-effect-layer-${effect}`} aria-hidden>
      {Array.from({ length: effect === 'rain' ? 42 : 28 }, (_, index) => (
        <span key={index} style={{ '--i': index } as React.CSSProperties} />
      ))}
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
      <path
        d="M7 31c-3-2-5-5-5-9 6 1 10 4 12 8"
        fill="currentColor"
      />
    </svg>
  );
}

function parseTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
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

function folderNameForId(folders: Folder[], folderId: string | null) {
  if (!folderId) return '';
  return folders.find((folder) => folder.id === folderId)?.name ?? '';
}
