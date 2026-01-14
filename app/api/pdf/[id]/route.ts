import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { verifyToken } from '@/lib/auth/jwt';

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } },
  tenantId: string
) {
  try {
    const id = params.id;

    // Get questionnaire
    const { data: questionnaire, error: questionnaireError } = await supabaseAdmin
      .from('questionnaires')
      .select('id, tenant_id, pdf_url, pdf_generating')
      .eq('id', id)
      .single();

    if (questionnaireError || !questionnaire) {
      return NextResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      );
    }

    // Verify tenant access
    if (questionnaire.tenant_id !== tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (!questionnaire.pdf_url) {
      if (questionnaire.pdf_generating) {
        return NextResponse.json(
          { error: 'PDF is being generated' },
          { status: 202 }
        );
      }
      return NextResponse.json(
        { error: 'PDF not available' },
        { status: 404 }
      );
    }

    // Fetch PDF from Supabase Storage
    const urlParts = questionnaire.pdf_url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const bucket = 'pdfs';

    const { data, error: downloadError } = await supabaseAdmin.storage
      .from(bucket)
      .download(fileName);

    if (downloadError || !data) {
      console.error('Error downloading PDF:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download PDF' },
        { status: 500 }
      );
    }

    // Convert blob to buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/pdf/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tenantId = await getAuthenticatedTenant(request);
  
  if (!tenantId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return handler(request, { params }, tenantId);
}

async function getAuthenticatedTenant(request: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  return payload?.tenant_id || null;
}
