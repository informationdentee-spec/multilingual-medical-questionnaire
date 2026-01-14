import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '../auth/jwt';

export async function getAuthenticatedTenant(request: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  return payload?.tenant_id || null;
}

export function requireAuth(
  handler: (request: NextRequest, context: any, tenantId: string) => Promise<NextResponse>
) {
  return async (request: NextRequest, context: any) => {
    const tenantId = await getAuthenticatedTenant(request);
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return handler(request, context, tenantId);
  };
}
