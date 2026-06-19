import type { AppState, ChatMessage } from '../src/types';

export const mockState: AppState = {
  prompts: [
    {
      id: 'prompt-1',
      title: '代码审查专家',
      content:
        '你是一位资深代码审查专家。请审查以下代码，重点关注：可读性、潜在 bug、性能与安全风险，并给出可执行的改进建议。',
      tags: ['编程', '审查'],
      createdAt: '2026-06-18T10:00:00.000Z',
      updatedAt: '2026-06-18T10:00:00.000Z',
    },
    {
      id: 'prompt-2',
      title: '周报生成器',
      content: '请根据我提供的本周工作要点，生成一份结构清晰、重点突出的中文周报，包含「本周进展」「下周计划」「风险与求助」。',
      tags: ['职场', '写作'],
      createdAt: '2026-06-17T09:00:00.000Z',
      updatedAt: '2026-06-17T09:00:00.000Z',
    },
  ],
  folders: [
    {
      id: 'folder-1',
      name: '工作',
      color: '#2563eb',
      createdAt: '2026-06-15T08:00:00.000Z',
      updatedAt: '2026-06-15T08:00:00.000Z',
    },
    {
      id: 'folder-2',
      name: '学习',
      color: '#16a34a',
      createdAt: '2026-06-16T08:00:00.000Z',
      updatedAt: '2026-06-16T08:00:00.000Z',
    },
  ],
  savedChats: [
    {
      id: 'chat-1',
      title: 'Python 排序算法对比',
      url: 'https://chat.deepseek.com/a/abc123',
      folderId: 'folder-2',
      tags: ['算法', 'Python'],
      preview: '帮我对比快速排序、归并排序和 Timsort 的时间复杂度与适用场景。',
      savedAt: '2026-06-18T11:00:00.000Z',
      updatedAt: '2026-06-18T11:00:00.000Z',
    },
    {
      id: 'chat-2',
      title: '周报模板润色',
      url: 'https://chat.deepseek.com/a/def456',
      folderId: 'folder-1',
      tags: ['写作'],
      preview: '把这份粗略的周报改写得更专业、更有条理。',
      savedAt: '2026-06-17T17:00:00.000Z',
      updatedAt: '2026-06-17T17:00:00.000Z',
    },
  ],
  settings: { panelEnabled: true, visualEffect: 'off' },
};

export const mockMessages: ChatMessage[] = [
  {
    id: 'message-1',
    index: 1,
    role: 'user',
    text: '帮我写一段 Python 排序的示例代码，并解释时间复杂度。',
  },
  {
    id: 'message-2',
    index: 2,
    role: 'assistant',
    text: '当然，下面是一段使用 sorted() 内置函数对列表进行排序的示例，它底层使用 Timsort 算法，平均与最坏时间复杂度均为 O(n log n)。',
  },
  {
    id: 'message-3',
    index: 3,
    role: 'user',
    text: '能再加上逐行注释吗？',
  },
  {
    id: 'message-4',
    index: 4,
    role: 'assistant',
    text: '没问题，已补充逐行注释。你可以直接复制运行，也可以把它改造成对自定义对象排序。',
  },
];
