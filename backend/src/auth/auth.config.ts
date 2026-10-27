import type { JwtSignOptions } from '@nestjs/jwt';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET must be set');
  }

  return secret;
}

export function getJwtSignOptions(): JwtSignOptions {
  return {
    algorithm: 'HS256',
    expiresIn: (process.env.JWT_EXPIRATION ||
      '15m') as JwtSignOptions['expiresIn'],
  };
}
