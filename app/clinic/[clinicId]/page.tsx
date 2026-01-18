import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ clinicId: string | string[] | undefined }> | { clinicId: string | string[] | undefined };
}

export default async function ClinicPage({ params }: PageProps) {
  // Handle both Promise and direct params (Next.js 14 compatibility)
  const resolvedParams = params instanceof Promise ? await params : params;
  
  // Ensure clinicId is a string
  const clinicId: string = Array.isArray(resolvedParams.clinicId) 
    ? resolvedParams.clinicId[0] ?? ''
    : (resolvedParams.clinicId ?? '');

  if (!clinicId) {
    redirect('/');
  }

  // Redirect to select-language page
  redirect(`/clinic/${clinicId}/select-language`);
}
