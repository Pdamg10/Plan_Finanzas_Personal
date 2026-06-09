// Shared avatar colour palette used by Layout sidebar and UserSettingsPage

export const AVATAR_COLORS: { key: string; label: string; from: string; to: string }[] = [
  { key: 'violet', label: 'Violeta',    from: '#8b5cf6', to: '#ec4899' },
  { key: 'blue',   label: 'Azul',       from: '#3b82f6', to: '#06b6d4' },
  { key: 'green',  label: 'Verde',      from: '#10b981', to: '#34d399' },
  { key: 'orange', label: 'Naranja',    from: '#f97316', to: '#fbbf24' },
  { key: 'rose',   label: 'Rosa',       from: '#f43f5e', to: '#fb7185' },
  { key: 'indigo', label: 'Índigo',     from: '#6366f1', to: '#8b5cf6' },
  { key: 'teal',   label: 'Verde Azul', from: '#0d9488', to: '#2dd4bf' },
  { key: 'amber',  label: 'Ámbar',      from: '#d97706', to: '#fcd34d' },
];

export function getAvatarGradient(colorKey?: string): string {
  const found = AVATAR_COLORS.find(c => c.key === colorKey);
  return found
    ? `linear-gradient(135deg, ${found.from}, ${found.to})`
    : `linear-gradient(135deg, #8b5cf6, #ec4899)`;   // default violet-pink
}
