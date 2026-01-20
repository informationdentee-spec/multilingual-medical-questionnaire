import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import { QuestionnaireList } from '@/components/admin/questionnaire-list';

interface PageProps {
  params: Promise<{ clinicId: string | string[] | undefined }> | { clinicId: string | string[] | undefined };
}

async function getClinicName(clinicId: string): Promise<string | undefined> {
  try {
    // clinic_settingsテーブルからクリニック名を取得（将来的に拡張可能）
    // 現在はclinicIdをそのまま使用
    const { data } = await supabaseAdmin
      .from('clinic_settings')
      .select('clinic_id')
      .eq('clinic_id', clinicId)
      .single();
    
    // 将来的にclinic_nameカラムが追加されたら使用
    return undefined;
  } catch (error) {
    return undefined;
  }
}

export default async function AdminPage({ params }: PageProps) {
  const resolvedParams = params instanceof Promise ? await params : params;
  
  const clinicId: string = Array.isArray(resolvedParams.clinicId) 
    ? resolvedParams.clinicId[0] ?? ''
    : (resolvedParams.clinicId ?? '');
  
  if (!clinicId) {
    notFound();
  }
  
  // クリニック名を取得（将来的に拡張可能）
  const clinicName = await getClinicName(clinicId);
  
  return <QuestionnaireList clinicId={clinicId} clinicName={clinicName} />;
}
