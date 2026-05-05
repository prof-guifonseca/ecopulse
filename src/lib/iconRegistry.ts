import {
  Award,
  Battery,
  Camera,
  Coins,
  Cpu,
  Droplet,
  Flame,
  Hammer,
  Heart,
  Leaf,
  MapPin,
  MessageCircle,
  Package,
  Recycle,
  Scissors,
  Shirt,
  Sparkles,
  Star,
  Target,
  Trees,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * Registry of lucide icons keyed by short string IDs that data files
 * can reference in iconName fields. Keeps data tree-shakeable while
 * giving every dataset a single, consistent visual vocabulary.
 */
export const ICON_REGISTRY = {
  award: Award,
  battery: Battery,
  camera: Camera,
  coins: Coins,
  cpu: Cpu,
  droplet: Droplet,
  flame: Flame,
  hammer: Hammer,
  heart: Heart,
  leaf: Leaf,
  mapPin: MapPin,
  messageCircle: MessageCircle,
  package: Package,
  recycle: Recycle,
  scissors: Scissors,
  shirt: Shirt,
  sparkles: Sparkles,
  star: Star,
  target: Target,
  trees: Trees,
  trophy: Trophy,
  users: Users,
  zap: Zap,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICON_REGISTRY;

export function resolveIcon(name: IconName | undefined | null): LucideIcon | null {
  if (!name) return null;
  return ICON_REGISTRY[name] ?? null;
}
