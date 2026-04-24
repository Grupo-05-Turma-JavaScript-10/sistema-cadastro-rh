import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { HistoricoController } from '../src/historico/controllers/historico.controller';
import { HistoricoService } from '../src/historico/services/historico.service';
import { JwtAuthGuard } from '../src/auth/guard/jwt-auth.guard';

const mockHistoricoService = {
  findByColaboradorId: jest.fn(),
};

describe('HistoricoController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HistoricoController],
      providers: [
        {
          provide: HistoricoService,
          useValue: mockHistoricoService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
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

  describe('GET /historico/colaborador/:id', () => {
    it('deve retornar o histórico do colaborador (200 OK)', async () => {
      mockHistoricoService.findByColaboradorId.mockResolvedValue([{ id: 1, motivo: 'Promoção' }]);

      const response = await request(app.getHttpServer())
        .get('/historico/colaborador/1')
        .expect(200);

      expect(response.body).toEqual([{ id: 1, motivo: 'Promoção' }]);
      expect(mockHistoricoService.findByColaboradorId).toHaveBeenCalledWith(1);
    });

    it('deve falhar se ID não for numérico (ParseIntPipe)', async () => {
      await request(app.getHttpServer())
        .get('/historico/colaborador/abc')
        .expect(400);

      expect(mockHistoricoService.findByColaboradorId).not.toHaveBeenCalled();
    });
  });
});
