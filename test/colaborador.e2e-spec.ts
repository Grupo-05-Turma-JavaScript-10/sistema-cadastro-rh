import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ColaboradorController } from '../src/colaborador/controllers/colaborador.controller';
import { ColaboradorService } from '../src/colaborador/services/colaborador.service';
import { JwtAuthGuard } from '../src/auth/guard/jwt-auth.guard';

const mockColaboradorService = {
  calcularSalario: jest.fn(),
  findAll: jest.fn(),
  getAlertasVencimentos: jest.fn(),
  create: jest.fn(),
};

describe('ColaboradorController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ColaboradorController],
      providers: [
        {
          provide: ColaboradorService,
          useValue: mockColaboradorService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // Burlar Guard
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

  describe('POST /colaboradores', () => {
    it('deve retornar 400 se faltar campos obrigatórios', async () => {
      const payloadInvalido = { nome: 'Falta Campos' };

      const response = await request(app.getHttpServer())
        .post('/colaboradores')
        .send(payloadInvalido)
        .expect(400);

      expect(response.body.message).toContain('cpf should not be empty');
      expect(response.body.message).toContain('email must be an email');
    });

    it('deve retornar 400 se tipoContrato for inválido (IsIn validation)', async () => {
      const payloadInvalido = {
        nome: 'João',
        cpf: '12345678901',
        email: 'joao@email.com',
        data_admissao: '2023-01-01',
        salario: 3000,
        tipoContrato: 'FREELANCER', // Inválido, deve ser CLT, PJ ou ESTAGIO
        status: true,
      };

      const response = await request(app.getHttpServer())
        .post('/colaboradores')
        .send(payloadInvalido)
        .expect(400);

      expect(response.body.message).toContain('tipoContrato must be one of the following values: CLT, PJ, ESTAGIO');
    });

    it('deve criar colaborador com sucesso', async () => {
      const payloadValido = {
        nome: 'João',
        cpf: '12345678901',
        email: 'joao@email.com',
        data_admissao: '2023-01-01',
        salario: 3000,
        tipoContrato: 'CLT',
        status: true,
      };

      mockColaboradorService.create.mockResolvedValue({ id: 1, ...payloadValido });

      const response = await request(app.getHttpServer())
        .post('/colaboradores')
        .send(payloadValido)
        .expect(201);

      expect(response.body).toHaveProperty('id', 1);
    });
  });

  describe('PUT /colaboradores/calcular-salario/:id', () => {
    it('deve calcular salário com sucesso mesmo se faltar body (pois falta DTO com validação no Controller)', async () => {
      mockColaboradorService.calcularSalario.mockResolvedValue(0);

      await request(app.getHttpServer())
        .put('/colaboradores/calcular-salario/1')
        .send({ bonus: 100 })
        .expect(200);
        
      // Recebe undefined para as variaveis que não foram enviadas no body
      expect(mockColaboradorService.calcularSalario).toHaveBeenCalledWith(1, undefined, undefined, 100, undefined);
    });

    it('deve calcular salário com sucesso enviando todos os dados', async () => {
      mockColaboradorService.calcularSalario.mockResolvedValue(5500);

      const response = await request(app.getHttpServer())
        .put('/colaboradores/calcular-salario/1')
        .send({ horasTrabalhadas: 100, valorHora: 50, bonus: 500 })
        .expect(200);

      expect(response.text).toBe('5500'); // Note: retorna um number, o request interpreta como text
      expect(mockColaboradorService.calcularSalario).toHaveBeenCalledWith(1, 100, 50, 500, undefined);
    });
  });

  describe('GET /colaboradores/exportar/csv', () => {
    it('deve retornar arquivo CSV (Content-Type text/csv)', async () => {
      const mockColaboradores = [
        {
          id: 1,
          nome: 'Maria',
          cpf: '111',
          email: 'm@m.com',
          status: true,
          encargos: 0,
          custoTotal: 0,
        },
      ];
      mockColaboradorService.findAll.mockResolvedValue(mockColaboradores);

      const response = await request(app.getHttpServer())
        .get('/colaboradores/exportar/csv')
        .expect(200)
        .expect('Content-Type', /text\/csv/);

      expect(response.headers['content-disposition']).toContain('attachment; filename=colaboradores.csv');
      expect(response.text).toContain('Maria');
    });
  });
});
