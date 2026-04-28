export const C = {
  // Backgrounds
  bg:          '#09091a',
  surface:     '#10102a',
  surfaceHigh: '#18183a',
  card:        '#13133a',

  // Borders
  border:      '#252550',
  borderLight: '#32327a',

  // Brand
  accent:      '#8b5cf6',   // violet
  accentDeep:  '#6d28d9',
  accentGlow:  'rgba(139,92,246,0.18)',
  accentLight: '#c4b5fd',

  // Semantic
  warm:        '#fb923c',   // warmth / high echo
  teal:        '#2dd4bf',   // calm / harmony
  rose:        '#f43f5e',   // tension / conflict

  // Text
  textPrimary: '#ede9fe',
  textSub:     '#a78bfa',
  textMuted:   '#6d6a9c',
  textFaint:   '#3d3a6a',

  // Bubbles
  userBubble:  '#1e1a4a',
  botBubble:   '#0f0f28',
};

export const font = {
  brand:  { fontWeight: '800', letterSpacing: 1.2 },
  title:  { fontWeight: '700' },
  body:   { fontWeight: '400' },
  label:  { fontWeight: '600', letterSpacing: 0.4 },
  mono:   { fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace' },
};
