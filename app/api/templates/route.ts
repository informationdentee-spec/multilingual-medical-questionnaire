import { NextRequest, NextResponse } from 'next/server';
import { getTemplate } from '@/lib/templates/get-template';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');
    
    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id parameter is required' },
        { status: 400 }
      );
    }
    
    const template = await getTemplate(clinicId);
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error in GET /api/templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
