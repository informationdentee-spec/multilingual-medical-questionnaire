// In-memory store for login attempts (MVP implementation)
interface LoginAttempt {
  count: number;
  lockedUntil: number | null;
}

const loginAttempts = new Map<string, LoginAttempt>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function recordFailedAttempt(email: string): void {
  const now = Date.now();
  const attempt = loginAttempts.get(email) || { count: 0, lockedUntil: null };

  // Reset if lockout period has passed
  if (attempt.lockedUntil && now > attempt.lockedUntil) {
    attempt.count = 0;
    attempt.lockedUntil = null;
  }

  attempt.count += 1;

  // Lock if max attempts reached
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION;
  }

  loginAttempts.set(email, attempt);
}

export function isLocked(email: string): boolean {
  const attempt = loginAttempts.get(email);
  if (!attempt) return false;

  const now = Date.now();
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return true;
  }

  // Clear if lockout period has passed
  if (attempt.lockedUntil && now >= attempt.lockedUntil) {
    attempt.count = 0;
    attempt.lockedUntil = null;
    loginAttempts.set(email, attempt);
  }

  return false;
}

export function clearAttempts(email: string): void {
  loginAttempts.delete(email);
}
