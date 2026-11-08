import {
  Activity,
  Brain,
  ChartCandlestick,
  ChartLine,
  Compass,
  Crown,
  FileText,
  Footprints,
  Landmark,
  Layers,
  Shield,
  Sprout,
  Target,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { BadgeIcon, ModuleIcon } from '@/lib/course/types';

export const MODULE_ICONS: Record<ModuleIcon, LucideIcon> = {
  landmark: Landmark,
  shield: Shield,
  candlestick: ChartCandlestick,
  'file-text': FileText,
  activity: Activity,
  brain: Brain,
};

export const BADGE_ICONS: Record<BadgeIcon, LucideIcon> = {
  footprints: Footprints,
  target: Target,
  sprout: Sprout,
  'line-chart': ChartLine,
  compass: Compass,
  crown: Crown,
  zap: Zap,
  layers: Layers,
};
