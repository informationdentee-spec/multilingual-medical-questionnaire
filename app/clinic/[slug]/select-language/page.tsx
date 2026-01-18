import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string | string[] | undefined }> | { slug: string | string[] | undefined };
}

export default async function SelectLanguagePage({ params }: PageProps) {
  // Handle both Promise and direct params (Next.js 14 compatibility)
  const resolvedParams = params instanceof Promise ? await params : params;
  
  // Ensure slug is a string
  const slug: string = Array.isArray(resolvedParams.slug) 
    ? resolvedParams.slug[0] ?? ''
    : (resolvedParams.slug ?? '');

  if (!slug) {
    redirect('/');
  }

  // Redirect to the main clinic page (which shows language selection)
  redirect(`/clinic/${slug}`);
}

