import { notFound } from 'next/navigation';
import { QuestionnaireDetail } from '@/components/admin/questionnaire-detail';

interface PageProps {
  params: Promise<{ clinicId: string | string[] | undefined; responseId: string | string[] | undefined }> | { clinicId: string | string[] | undefined; responseId: string | string[] | undefined };
}

export default async function AdminDetailPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  
  const clinicId: string = Array.isArray(resolvedParams.clinicId) 
    ? resolvedParams.clinicId[0] ?? ''
    : (resolvedParams.clinicId ?? '');
  
  const responseId: string = Array.isArray(resolvedParams.responseId) 
    ? resolvedParams.responseId[0] ?? ''
    : (resolvedParams.responseId ?? '');
  
  if (!clinicId || !responseId) {
    notFound();
  }
  
  return <QuestionnaireDetail clinicId={clinicId} responseId={responseId} />;
}
