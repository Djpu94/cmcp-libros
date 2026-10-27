import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: { user: { findUnique: ReturnType<typeof vi.fn> } };
  let jwtService: { sign: ReturnType<typeof vi.fn> };
  let hashedPassword: string;

  beforeAll(async () => {
    hashedPassword = await hash('valid-password', 4);
  });

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
      },
    };
    jwtService = {
      sign: vi.fn().mockReturnValue('signed-access-token'),
    };
    authService = new AuthService(
      prisma as unknown as PrismaService,
      jwtService as unknown as JwtService,
    );
  });

  it('returns a signed token and safe user data for valid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'admin@cmcp.cl',
      password: hashedPassword,
      role: 'ADMIN',
    });

    await expect(
      authService.login('admin@cmcp.cl', 'valid-password'),
    ).resolves.toEqual({
      accessToken: 'signed-access-token',
      user: { id: 'user-1', email: 'admin@cmcp.cl', role: 'ADMIN' },
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'admin@cmcp.cl',
      role: 'ADMIN',
    });
  });

  it('rejects an email that does not match a user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.login('missing@cmcp.cl', 'valid-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('rejects an incorrect password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'admin@cmcp.cl',
      password: hashedPassword,
      role: 'ADMIN',
    });

    await expect(
      authService.login('admin@cmcp.cl', 'wrong-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
