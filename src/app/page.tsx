import { redirect } from 'next/navigation';
import { getSortedChaptersData } from '@/lib/markdown';

export default function Home() {
  const chapters = getSortedChaptersData();

  if (chapters.length > 0) {
    redirect(`/chapter/${chapters[0].id}`);
  }

  return (
    <div className="flex items-center justify-center w-full h-full text-white">
      <p>No content found.</p>
    </div>
  );
}
