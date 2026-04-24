import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Bcrypt } from '../../auth/bcrypt/bcrypt';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Mocks de dependências do TypeORM e Bcrypt
 */
const mockUsuarioRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
};

const mockBcrypt = {
  criptografarSenha: jest.fn(),
};

describe('UsuarioService', () => {
  let usuarioService: UsuarioService;

  beforeEach(async () => {
    // Limpamos o estado dos mocks antes de cada teste
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        // DICA DE QA: É assim que mockamos o repositório do TypeORM injetado via @InjectRepository!
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
        {
          provide: Bcrypt,
          useValue: mockBcrypt,
        },
      ],
    }).compile();

    usuarioService = module.get<UsuarioService>(UsuarioService);
  });

  it('deve estar definido', () => {
    expect(usuarioService).toBeDefined();
  });

  describe('findById', () => {
    /**
     * @description Testa a busca de usuário por ID com sucesso.
     */
    it('deve retornar um usuário se encontrado pelo ID', async () => {
      // Arrange
      const usuarioMock = { id: 1, nome: 'João', usuario: 'joao@email.com' };
      mockUsuarioRepository.findOne.mockResolvedValue(usuarioMock);

      // Act
      const resultado = await usuarioService.findById(1);

      // Assert
      expect(resultado).toEqual(usuarioMock);
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    /**
     * @description Testa a exceção quando o usuário não existe.
     */
    it('deve lançar HttpException (404) se o usuário não for encontrado pelo ID', async () => {
      // Arrange
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(usuarioService.findById(99)).rejects.toThrow(
        new HttpException('Usuario não encontrado!', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('create', () => {
    /**
     * @description Testa o caminho feliz: criação de um novo usuário criptografando a senha.
     */
    it('deve criar um novo usuário com senha criptografada', async () => {
      // Arrange
      const novoUsuario = { nome: 'Maria', usuario: 'maria@email.com', senha: '123' } as Usuario;
      const senhaHasheada = 'hash_secreto_123';
      
      // Simula que o usuário não existe ainda (para passar na validação)
      mockUsuarioRepository.findOne.mockResolvedValue(null);
      // Simula a criptografia da senha
      mockBcrypt.criptografarSenha.mockResolvedValue(senhaHasheada);
      // Simula o retorno do banco ao salvar
      mockUsuarioRepository.save.mockResolvedValue({ ...novoUsuario, id: 2, senha: senhaHasheada });

      // Act
      const resultado = await usuarioService.create(novoUsuario);

      // Assert
      expect(resultado.senha).toEqual(senhaHasheada);
      expect(mockUsuarioRepository.save).toHaveBeenCalled();
      expect(mockBcrypt.criptografarSenha).toHaveBeenCalledWith('123');
    });

    /**
     * @description Impede a criação de usuários duplicados (mesmo e-mail/username).
     */
    it('deve lançar HttpException (400) se o usuário já existir', async () => {
      // Arrange
      const usuarioExistente = { nome: 'Maria', usuario: 'maria@email.com', senha: '123' } as Usuario;
      mockUsuarioRepository.findOne.mockResolvedValue(usuarioExistente); // Simula que já encontrou no banco

      // Act & Assert
      await expect(usuarioService.create(usuarioExistente)).rejects.toThrow(
        new HttpException('O Usuario já existe!', HttpStatus.BAD_REQUEST),
      );
      // Garante que não tentou salvar nem criptografar nada
      expect(mockUsuarioRepository.save).not.toHaveBeenCalled();
      expect(mockBcrypt.criptografarSenha).not.toHaveBeenCalled();
    });
  });
});
