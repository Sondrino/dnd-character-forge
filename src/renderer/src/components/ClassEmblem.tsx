import { Axe, Eye, Flame, Hand, Leaf, Music, ShieldCheck, Sun, Swords, Target, User, VenetianMask, WandSparkles } from 'lucide-react'

const ICONS: Record<string, typeof Axe> = {
  barbarian: Axe,
  bard: Music,
  cleric: Sun,
  druid: Leaf,
  fighter: Swords,
  monk: Hand,
  paladin: ShieldCheck,
  ranger: Target,
  rogue: VenetianMask,
  sorcerer: Flame,
  warlock: Eye,
  wizard: WandSparkles
}

export const CLASS_COLORS: Record<string, string> = {
  barbarian: '#c0392b',
  bard: '#c2569b',
  cleric: '#e0b94a',
  druid: '#5fb37a',
  fighter: '#b9773c',
  monk: '#4fb3b3',
  paladin: '#e6c76a',
  ranger: '#6f9e4d',
  rogue: '#8a8f99',
  sorcerer: '#e0574a',
  warlock: '#8b5cf6',
  wizard: '#5aa9e6'
}

export function ClassEmblem({ classId, size = 40 }: { classId?: string; size?: number }) {
  const Icon = (classId && ICONS[classId]) || User
  const color = (classId && CLASS_COLORS[classId]) || 'var(--gold)'
  return (
    <span
      className="inline-flex items-center justify-center rounded-full"
      style={{ width: size * 1.5, height: size * 1.5, background: `radial-gradient(circle, ${color}33, transparent 70%)`, color }}
    >
      <Icon size={size} strokeWidth={1.4} />
    </span>
  )
}
