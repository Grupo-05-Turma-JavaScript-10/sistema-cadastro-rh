import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { UsuarioController } from '../src/usuario/controllers/usuario.controller';
import { UsuarioService } from '../src/usuario/services/usuario.service';
import { JwtAuthGuard } from '../src/auth/guard/jwt-auth.guard';

/**
 * Mock do UsuarioService para isolar o banco de dados.
 * No teste E2E real, poderíamos usar um banco de dados de teste (SQLite em memória).
 * Aqui estamos focando em testar a camada HTTP, os Guards e o class-validator (Pipes).
 */
const mockUsuarioService = {
  create: jest.fn(),
  findAll: jest.fn(),
};

describe('UsuarioController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        {
          provide: UsuarioService,
          useValue: mockUsuarioService,
        },
      ],
    })
      // Podemos "burlar" ou testar os Guards do NestJS
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // Permite o acesso às rotas protegidas neste teste específico
      .compile();

    app = moduleFixture.createNestApplication();
    
    // IMPORTANTE: Ativamos os Pipes globais para que o class-validator funcione!
    app.useGlobalPipes(new ValidationPipe());
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /usuarios/cadastrar', () => {
    it('deve retornar 400 (Bad Request) se a senha for menor que 8 caracteres (Validação class-validator)', async () => {
      // Arrange
      const payloadInvalido = {
        nome: 'Teste',
        usuario: 'teste@email.com',
        senha: '123', // Senha curta, deve falhar no @MinLength(8)
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/usuarios/cadastrar')
        .send(payloadInvalido)
        .expect(400); // Esperamos que o NestJS barre antes mesmo de chegar no Service!

      // Verificamos a mensagem gerada automaticamente pelo class-validator
      expect(response.body.message).toContain('senha must be longer than or equal to 8 characters');
      expect(mockUsuarioService.create).not.toHaveBeenCalled(); // O Service NUNCA deve ser chamado se o payload for inválido
    });

    it('deve retornar 400 se o email for inválido', async () => {
      // Arrange
      const payloadInvalido = {
        nome: 'Teste',
        usuario: 'email_sem_arroba', // Inválido, deve falhar no @IsEmail()
        senha: 'senha_segura_123',
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/usuarios/cadastrar')
        .send(payloadInvalido)
        .expect(400);

      expect(response.body.message).toContain('usuario must be an email');
    });

    it('deve retornar 201 (Created) quando o payload for válido', async () => {
      // Arrange
      const payloadValido = {
        nome: 'Teste',
        usuario: 'teste@email.com',
        senha: 'senha_segura_123',
      };
      
      mockUsuarioService.create.mockResolvedValue({ id: 1, ...payloadValido });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/usuarios/cadastrar')
        .send(payloadValido)
        .expect(201); // 201 Created

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body.nome).toEqual(payloadValido.nome);
      expect(mockUsuarioService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /usuarios/all', () => {
    it('deve retornar a lista de usuários com status 200 (OK)', async () => {
      // Arrange
      mockUsuarioService.findAll.mockResolvedValue([
        { id: 1, nome: 'João', usuario: 'joao@email.com' },
      ]);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/usuarios/all')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0]).toHaveProperty('nome', 'João');
      expect(mockUsuarioService.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
