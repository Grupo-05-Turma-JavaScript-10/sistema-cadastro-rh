import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PendenciaController } from '../src/pendencia/controllers/pendencia.controller';
import { PendenciaService } from '../src/pendencia/services/pendencia.service';
import { JwtAuthGuard } from '../src/auth/guard/jwt-auth.guard';

const mockPendenciaService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('PendenciaController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PendenciaController],
      providers: [
        {
          provide: PendenciaService,
          useValue: mockPendenciaService,
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

  describe('GET /pendencias', () => {
    it('deve retornar todas as pendências (200 OK)', async () => {
      mockPendenciaService.findAll.mockResolvedValue([{ id: 1, titulo: 'RG' }]);

      const response = await request(app.getHttpServer())
        .get('/pendencias')
        .expect(200);

      expect(response.body).toEqual([{ id: 1, titulo: 'RG' }]);
      expect(mockPendenciaService.findAll).toHaveBeenCalledWith({});
    });

    it('deve processar query params de filtro (colaboradorId e concluida)', async () => {
      mockPendenciaService.findAll.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/pendencias?colaboradorId=1&concluida=true')
        .expect(200);

      expect(mockPendenciaService.findAll).toHaveBeenCalledWith({
        colaboradorId: 1,
        concluida: true,
      });
    });
  });

  describe('GET /pendencias/:id', () => {
    it('deve retornar pendência específica por ID (200 OK)', async () => {
      mockPendenciaService.findById.mockResolvedValue({ id: 2, titulo: 'CPF' });

      const response = await request(app.getHttpServer())
        .get('/pendencias/2')
        .expect(200);

      expect(response.body).toEqual({ id: 2, titulo: 'CPF' });
      expect(mockPendenciaService.findById).toHaveBeenCalledWith(2);
    });
  });

  describe('PUT /pendencias', () => {
    it('deve atualizar pendência com sucesso (200 OK)', async () => {
      const payloadValido = { id: 1, titulo: 'RG Atualizado', concluida: true, obrigatoria: true };
      mockPendenciaService.update.mockResolvedValue(payloadValido);

      const response = await request(app.getHttpServer())
        .put('/pendencias')
        .send(payloadValido)
        .expect(200);

      expect(response.body).toEqual(payloadValido);
      expect(mockPendenciaService.update).toHaveBeenCalledWith(payloadValido);
    });
  });

  describe('DELETE /pendencias/:id', () => {
    it('deve deletar pendência (204 No Content)', async () => {
      mockPendenciaService.delete.mockResolvedValue({ affected: 1 });

      await request(app.getHttpServer())
        .delete('/pendencias/1')
        .expect(204);

      expect(mockPendenciaService.delete).toHaveBeenCalledWith(1);
    });
  });
});
