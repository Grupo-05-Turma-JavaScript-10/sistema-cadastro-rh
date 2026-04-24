import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from './../../usuario/services/usuario.service';
import { Bcrypt } from '../bcrypt/bcrypt';
import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';

/**
 * Mocks de dependências
 * Usamos funções mockadas do Jest para simular o comportamento de serviços externos.
 * Isso garante que o teste seja isolado e não dependa de banco de dados real (UsuarioService)
 * ou geração real de tokens e criptografia (JwtService, Bcrypt).
 */
const mockUsuarioService = {
  findByUsuario: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockBcrypt = {
  compararSenhas: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    // Resetar mocks antes de cada teste para evitar interferências de estado entre eles
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsuarioService,
          useValue: mockUsuarioService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: Bcrypt,
          useValue: mockBcrypt,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  /**
   * Validação da criação do serviço.
   * Garante que a injeção de dependências do NestJS foi bem-sucedida.
   */
  it('deve estar definido', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    /**
     * @description Testa o cenário de erro onde o usuário não existe no banco de dados.
     * @expected Deve lançar uma HttpException com status NOT_FOUND.
     */
    it('deve lançar erro se o usuário não for encontrado', async () => {
      // Arrange (Preparação)
      mockUsuarioService.findByUsuario.mockResolvedValue(null);

      // Act & Assert (Ação e Validação)
      await expect(authService.validateUser('usuario_teste', 'senha123')).rejects.toThrow(
        new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND),
      );
    });

    /**
     * @description Testa o cenário onde o usuário existe, mas a senha é incorreta.
     * @expected Deve retornar null, que será tratado pelo Passport como falha de autenticação.
     */
    it('deve retornar null se a senha for inválida', async () => {
      // Arrange
      const usuarioMock = { id: 1, usuario: 'teste', senha: 'hash_password' };
      mockUsuarioService.findByUsuario.mockResolvedValue(usuarioMock);
      mockBcrypt.compararSenhas.mockResolvedValue(false);

      // Act
      const resultado = await authService.validateUser('teste', 'senha_errada');

      // Assert
      expect(resultado).toBeNull();
      expect(mockBcrypt.compararSenhas).toHaveBeenCalledWith('senha_errada', 'hash_password');
    });

    /**
     * @description Testa o caminho feliz (Happy Path) da validação de usuário.
     * @expected Deve retornar os dados do usuário excluindo o campo de senha (segurança).
     */
    it('deve retornar o usuário (sem a senha) se a validação for um sucesso', async () => {
      // Arrange
      const usuarioMock = { id: 1, nome: 'Teste', usuario: 'teste', senha: 'hash_password' };
      mockUsuarioService.findByUsuario.mockResolvedValue(usuarioMock);
      mockBcrypt.compararSenhas.mockResolvedValue(true);

      // Act
      const resultado = await authService.validateUser('teste', 'senha_certa');

      // Assert
      expect(resultado).toEqual({ id: 1, nome: 'Teste', usuario: 'teste' });
      expect(resultado.senha).toBeUndefined(); // A senha não deve ser retornada
    });
  });

  describe('login', () => {
    /**
     * @description Testa o cenário de login com usuário inexistente.
     * @expected Deve lançar UnauthorizedException (401).
     */
    it('deve lançar UnauthorizedException se o usuário não for encontrado', async () => {
      // Arrange
      const loginDto = { usuario: 'inexistente', senha: '123' };
      mockUsuarioService.findByUsuario.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    /**
     * @description Testa o cenário de login com senha incorreta.
     * @expected Deve lançar UnauthorizedException (401).
     */
    it('deve lançar UnauthorizedException se a senha for incorreta', async () => {
      // Arrange
      const loginDto = { usuario: 'teste', senha: 'senha_errada' };
      const usuarioMock = { id: 1, usuario: 'teste', senha: 'hash_password' };
      
      mockUsuarioService.findByUsuario.mockResolvedValue(usuarioMock);
      mockBcrypt.compararSenhas.mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    /**
     * @description Testa o fluxo de login completo com sucesso (Happy Path).
     * @expected Deve retornar o payload formatado contendo o token JWT assinado.
     */
    it('deve retornar o payload de login com token JWT gerado', async () => {
      // Arrange
      const loginDto = { usuario: 'teste', senha: 'senha_certa' };
      const usuarioMock = { id: 1, nome: 'Nome Teste', usuario: 'teste', foto: 'url_foto', senha: 'hash_password' };
      const tokenFalso = 'jwt_token_123';
      
      mockUsuarioService.findByUsuario.mockResolvedValue(usuarioMock);
      mockBcrypt.compararSenhas.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(tokenFalso);

      // Act
      const resultado = await authService.login(loginDto);

      // Assert
      expect(resultado).toEqual({
        id: usuarioMock.id,
        nome: usuarioMock.nome,
        usuario: loginDto.usuario,
        senha: '', // Conforme regra de negócio da aplicação
        foto: usuarioMock.foto,
        token: `Bearer ${tokenFalso}`,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: loginDto.usuario });
    });
  });
});
