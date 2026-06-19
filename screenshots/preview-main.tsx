import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../entrypoints/popup/style.css';
import '../entrypoints/deepseek-panel.css';
import './preview-overrides.css';
import { PopupPreview, PanelPreview, LauncherPreview, EffectLayerPreview } from './preview-components';
import { mockState, mockMessages } from './mock-data';

type Tab = 'timeline' | 'prompts' | 'library' | 'effects';

function mount(id: string, node: React.ReactNode) {
  const el = document.getElementById(id);
  if (el) createRoot(el).render(<StrictMode>{node}</StrictMode>);
}

mount('popup', <PopupPreview state={mockState} />);

mount('launcher', <LauncherPreview />);

mount(
  'effect-snow',
  <div className="effect-stage">
    <EffectLayerPreview effect="snow" />
    <div className="effect-caption">雪 · snow</div>
  </div>,
);
mount(
  'effect-sakura',
  <div className="effect-stage">
    <EffectLayerPreview effect="sakura" />
    <div className="effect-caption">樱花 · sakura</div>
  </div>,
);
mount(
  'effect-rain',
  <div className="effect-stage">
    <EffectLayerPreview effect="rain" />
    <div className="effect-caption">雨 · rain</div>
  </div>,
);

(['timeline', 'prompts', 'library', 'effects'] as Tab[]).forEach((tab) => {
  mount(
    `panel-${tab}`,
    <PanelPreview state={mockState} messages={mockMessages} tab={tab} />,
  );
});
