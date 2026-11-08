import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ModuleView } from '@/components/course/ModuleView';
import { COURSE_MODULES, getModule } from '@/lib/course/content';

interface PageProps {
  params: Promise<{ moduleId: string }>;
}

// Statyczny eksport: generujemy tylko istniejące moduły, pozostałe adresy kończą się stroną 404
export const dynamicParams = false;

export function generateStaticParams() {
  return COURSE_MODULES.map((mod) => ({ moduleId: mod.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { moduleId } = await params;
  const mod = getModule(moduleId);
  return { title: mod ? mod.title : 'Moduł kursu' };
}

export default async function ModulePage({ params }: PageProps) {
  const { moduleId } = await params;
  if (!getModule(moduleId)) notFound();
  return <ModuleView moduleId={moduleId} />;
}
