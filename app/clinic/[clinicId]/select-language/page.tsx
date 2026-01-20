import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import { LanguageSelectDisplay } from '@/components/language-select/language-select-display';

interface PageProps {
  params: Promise<{ clinicId: string | string[] | undefined }> | { clinicId: string | string[] | undefined };
}

async function getTenant(clinicId: string) {
  const { data, error } = await supabaseAdmin
    .from('tenants')
    .select('id, slug, name')
    .eq('slug', clinicId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function SelectLanguagePage({ params }: PageProps) {
  // Handle both Promise and direct params (Next.js 14 compatibility)
  const resolvedParams = params instanceof Promise ? await params : params;
  
  // Ensure clinicId is a string
  const clinicId: string = Array.isArray(resolvedParams.clinicId) 
    ? resolvedParams.clinicId[0] ?? ''
    : (resolvedParams.clinicId ?? '');

  if (!clinicId) {
    notFound();
  }

  // Test mode: If clinicId is "test", allow access without database check
  if (clinicId === 'test') {
    return (
      <LanguageSelectDisplay
        clinicId={clinicId}
        clinicName="テスト歯科クリニック"
      />
    );
  }

  // Production mode: Get tenant information (clinicId is used as slug in database)
  const tenant = await getTenant(clinicId);

  // If tenant doesn't exist, return 404
  if (!tenant) {
    notFound();
  }

  // Display language selection page
  return (
    <LanguageSelectDisplay
      clinicId={clinicId}
      clinicName={tenant.name || undefined}
    />
  );
}
