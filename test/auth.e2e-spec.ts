import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../src/auth/controllers/auth.controller';
import { AuthService } from '../src/auth/services/auth.service';
import { LocalAuthGuard } from '../src/auth/guard/local-auth.guard';

const mockAuthService = {
  login: jest.fn(),
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: () => true }) // Bypass no Passport Local para focar no Controller
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /usuarios/logar', () => {
    it('deve retornar 200 e o payload de login com sucesso', async () => {
      const loginDto = { usuario: 'teste@email.com', senha: '123' };
      const responseMock = { token: 'Bearer token123', usuario: loginDto.usuario };

      mockAuthService.login.mockResolvedValue(responseMock);

      const response = await request(app.getHttpServer())
        .post('/usuarios/logar')
        .send(loginDto)
        .expect(200);

      expect(response.body).toEqual(responseMock);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
