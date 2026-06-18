import { useEffect, useState } from 'react';
import { getAppState, setSettings } from '@/src/storage';
import type { AppState, Settings, VisualEffect } from '@/src/types';

function App() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    void getAppState().then(setState);
  }, []);

  async function updateSettings(settings: Settings) {
    await setSettings(settings);
    setState((current) => (current ? { ...current, settings } : current));
  }

  if (!state) {
    return <main className="popup-shell">Loading...</main>;
  }

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
        <button
          type="button"
          onClick={() =>
            void updateSettings({
              ...state.settings,
              panelEnabled: !state.settings.panelEnabled,
            })
          }
        >
          页面面板：{state.settings.panelEnabled ? '开启' : '关闭'}
        </button>

        <label>
          视觉效果
          <select
            value={state.settings.visualEffect}
            onChange={(event) =>
              void updateSettings({
                ...state.settings,
                visualEffect: event.target.value as VisualEffect,
              })
            }
          >
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

export default App;
