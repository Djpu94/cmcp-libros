import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service.js';
import { AppModule } from '../app.module.js';
import { hash } from 'bcrypt';
import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import type { User } from '@prisma/client';

describe('Authentication HTTP endpoints', () => {
  let app: INestApplication;
  const user: User = {
    id: 'admin-1',
    email: 'admin@cmcp.cl',
    password: '',
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const prismaMock = {
    user: {
      findUnique: vi.fn(),
    },
  };

  beforeAll(async () => {
    vi.stubEnv('JWT_SECRET', 'test-secret-with-sufficient-length');
    user.password = await hash('valid-password', 4);
    prismaMock.user.findUnique.mockImplementation(
      ({ where }: { where: { email: string } }) =>
        where.email === user.email ? user : null,
    );

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    const swaggerDocument = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('CMPC Libros API').addBearerAuth().build(),
    );
    SwaggerModule.setup('api/docs', app, swaggerDocument);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    vi.unstubAllEnvs();
  });

  it('returns HTTP 200 and an access token after a valid login', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: 'valid-password' })
      .expect(200);

    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.user).toEqual({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  });

  it('rejects invalid emails and passwords shorter than six characters', async () => {
    prismaMock.user.findUnique.mockClear();

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'not-an-email', password: 'valid-password' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: 'short' })
      .expect(400);

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('returns the standard 401 error shape for a protected route without a token', async () => {
    const response = await request(app.getHttpServer()).get('/').expect(401);

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 401,
        timestamp: expect.any(String),
        path: '/',
        message: expect.any(String),
        error: 'Unauthorized',
      }),
    );
  });

  it('allows access to a protected route with a valid token', async () => {
    const jwtService = app.get(JwtService);
    const accessToken = jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const response = await request(app.getHttpServer())
      .get('/')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.data).toBe('Hello World!');
  });

  it('keeps Swagger documentation public', async () => {
    await request(app.getHttpServer()).get('/api/docs/').expect(200);
  });
});
