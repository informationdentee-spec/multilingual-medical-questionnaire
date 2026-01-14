import crypto from 'crypto';
import { hashPassword } from './password';

export async function generateResetToken(): Promise<string> {
  return crypto.randomBytes(32).toString('hex');
}

export async function hashToken(token: string): Promise<string> {
  return hashPassword(token);
}
