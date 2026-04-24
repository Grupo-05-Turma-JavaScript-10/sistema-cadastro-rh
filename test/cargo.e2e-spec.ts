import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { CargoController } from '../src/cargo/controllers/cargo.controller';
import { CargoService } from '../src/cargo/services/cargo.service';
import { JwtAuthGuard } from '../src/auth/guard/jwt-auth.guard';

const mockCargoService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findAllByDescricao: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('CargoController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CargoController],
      providers: [
        {
          provide: CargoService,
          useValue: mockCargoService,
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

  describe('GET /cargos', () => {
    it('deve retornar a lista de cargos', async () => {
      mockCargoService.findAll.mockResolvedValue([{ id: 1, nome: 'Dev' }]);

      const response = await request(app.getHttpServer())
        .get('/cargos')
        .expect(200);

      expect(response.body).toEqual([{ id: 1, nome: 'Dev' }]);
      expect(mockCargoService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /cargos', () => {
    it('deve bloquear a criação se nome e descrição estiverem vazios (Pipes/ClassValidator)', async () => {
      const payloadInvalido = {};

      const response = await request(app.getHttpServer())
        .post('/cargos')
        .send(payloadInvalido)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'nome should not be empty',
          'descricao should not be empty',
        ]),
      );
      expect(mockCargoService.create).not.toHaveBeenCalled();
    });

    it('deve criar um cargo com sucesso (201 Created)', async () => {
      const cargoValido = { nome: 'QA', descricao: 'Testes' };
      mockCargoService.create.mockResolvedValue({ id: 1, ...cargoValido });

      const response = await request(app.getHttpServer())
        .post('/cargos')
        .send(cargoValido)
        .expect(201);

      expect(response.body).toHaveProperty('id', 1);
      expect(mockCargoService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /cargos/:id', () => {
    it('deve validar ParseIntPipe para ID não numérico', async () => {
      await request(app.getHttpServer())
        .delete('/cargos/abc')
        .expect(400);

      expect(mockCargoService.delete).not.toHaveBeenCalled();
    });

    it('deve retornar 204 No Content ao deletar com sucesso', async () => {
      mockCargoService.delete.mockResolvedValue({ affected: 1 });

      await request(app.getHttpServer())
        .delete('/cargos/1')
        .expect(204);

      expect(mockCargoService.delete).toHaveBeenCalledWith(1);
    });
  });
});
