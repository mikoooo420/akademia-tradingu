import type { Metadata } from 'next';
import { CourseOverview } from '@/components/course/CourseOverview';

export const metadata: Metadata = { title: 'Mini-kurs inwestowania' };

export default function CoursePage() {
  return <CourseOverview />;
}
