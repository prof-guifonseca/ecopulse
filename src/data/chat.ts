import type { ChatConversation } from '@/types';

export const CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv1',
    with: { name: 'Marina S.', avatar: '👩‍🎨', level: 12 },
    lastMsg: 'Amei o tutorial! Vamos fazer juntas?',
    lastTime: '10min',
    unread: 2,
    messages: [
      { from: 'Marina S.', text: 'Oi! Vi que você completou o tutorial do vaso', time: '14:20', sent: false },
      { from: 'me', text: 'Sim! Ficou muito legal', time: '14:22', sent: true },
      { from: 'Marina S.', text: 'Amei o tutorial! Vamos fazer juntas?', time: '14:25', sent: false },
    ],
  },
  {
    id: 'conv2',
    with: { name: 'Pedro L.', avatar: '🧑‍💻', level: 8 },
    lastMsg: 'Valeu pela dica do EcoPonto!',
    lastTime: '2h',
    unread: 0,
    messages: [
      { from: 'Pedro L.', text: 'E aí, sabe onde descartar pilhas?', time: '11:00', sent: false },
      { from: 'me', text: 'Tem o EcoPonto no Centro, Rua das Flores 123', time: '11:05', sent: true },
      { from: 'Pedro L.', text: 'Valeu pela dica do EcoPonto!', time: '11:10', sent: false },
    ],
  },
  {
    id: 'conv3',
    with: { name: 'Julia R.', avatar: '👩‍🌾', level: 15 },
    lastMsg: 'O tutorial de horta vertical é incrível!',
    lastTime: '5h',
    unread: 1,
    messages: [
      { from: 'Julia R.', text: 'Vi que você escaneou vários produtos hoje!', time: '09:30', sent: false },
      { from: 'me', text: 'Sim, tô tentando achar alternativas melhores', time: '09:35', sent: true },
      { from: 'Julia R.', text: 'O tutorial de horta vertical é incrível!', time: '09:40', sent: false },
    ],
  },
  {
    id: 'conv4',
    with: { name: 'Rafael M.', avatar: '🧑‍🎤', level: 6 },
    lastMsg: 'Bora no mutirão sábado?',
    lastTime: '1d',
    unread: 0,
    messages: [
      { from: 'Rafael M.', text: 'Você viu o mutirão de limpeza?', time: 'Ontem', sent: false },
      { from: 'me', text: 'Vi sim! Parece muito legal', time: 'Ontem', sent: true },
      { from: 'Rafael M.', text: 'Bora no mutirão sábado?', time: 'Ontem', sent: false },
    ],
  },
];

export const CHAT_REPLIES = [
  'Que legal! 🌿',
  'Boa ideia! Vamos fazer isso',
  'Top demais! 💚',
  'Também quero tentar',
  'Amei! Me conta mais',
  'Show! Vou conferir',
  'Incrível! ♻️',
  'Valeu pela dica!',
  'Bora juntos! 🌱',
  'Isso é muito inspirador',
];
