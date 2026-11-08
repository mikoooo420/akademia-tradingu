import { ChartCandlestick, GraduationCap, History, LayoutDashboard, type LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Pulpit nawigacyjny', shortLabel: 'Pulpit', icon: LayoutDashboard },
  { href: '/handel', label: 'Symulator tradingu', shortLabel: 'Handel', icon: ChartCandlestick },
  { href: '/historia', label: 'Historia transakcji', shortLabel: 'Historia', icon: History },
  { href: '/kurs', label: 'Mini-kurs inwestowania', shortLabel: 'Kurs', icon: GraduationCap },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
