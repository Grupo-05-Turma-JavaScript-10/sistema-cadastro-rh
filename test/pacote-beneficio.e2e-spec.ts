import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PacoteBeneficioController } from '../src/pacote-beneficio/controllers/pacote-beneficio.controller';
import { PacoteBeneficioService } from '../src/pacote-beneficio/services/pacote-beneficio.service';
import { JwtAuthGuard } from '../src/auth/guard/jwt-auth.guard';

const mockPacoteService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('PacoteBeneficioController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PacoteBeneficioController],
      providers: [
        {
          provide: PacoteBeneficioService,
          useValue: mockPacoteService,
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

  describe('GET /pacotes-beneficios', () => {
    it('deve retornar lista de pacotes (200 OK)', async () => {
      mockPacoteService.findAll.mockResolvedValue([{ id: 1, nome: 'Premium' }]);

      const response = await request(app.getHttpServer())
        .get('/pacotes-beneficios')
        .expect(200);

      expect(response.body).toEqual([{ id: 1, nome: 'Premium' }]);
    });
  });

  describe('POST /pacotes-beneficios', () => {
    it('deve retornar 400 se nome ou valorTotal faltarem', async () => {
      const payloadInvalido = { descricao: 'Pacote basico' }; // falta nome e valorTotal

      const response = await request(app.getHttpServer())
        .post('/pacotes-beneficios')
        .send(payloadInvalido)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'nome should not be empty',
          'valorTotal must be a number conforming to the specified constraints',
        ]),
      );
    });

    it('deve retornar 201 Created se o payload for válido', async () => {
      const payloadValido = { nome: 'Premium', descricao: 'Tudo incluso', valorTotal: 1000.50 };
      mockPacoteService.create.mockResolvedValue({ id: 1, ...payloadValido });

      const response = await request(app.getHttpServer())
        .post('/pacotes-beneficios')
        .send(payloadValido)
        .expect(201);

      expect(response.body).toHaveProperty('id', 1);
    });
  });

  describe('DELETE /pacotes-beneficios/:id', () => {
    it('deve deletar um pacote com sucesso (204 No Content)', async () => {
      mockPacoteService.delete.mockResolvedValue({ affected: 1 });

      await request(app.getHttpServer())
        .delete('/pacotes-beneficios/1')
        .expect(204);

      expect(mockPacoteService.delete).toHaveBeenCalledWith(1);
    });
  });
});
