import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from './../../usuario/services/usuario.service';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Bcrypt } from '../bcrypt/bcrypt';
import { UsuarioLogin } from '../entities/usuariologin.entity';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService,
    private bcrypt: Bcrypt,
  ) {}

  // Validação de usuário para estratégias de login (Passport)
  async validateUser(username: string, password: string): Promise<any> {
    const buscaUsuario = await this.usuarioService.findByUsuario(username);

    if (!buscaUsuario) {
      throw new HttpException('Usuário não encontrado!', HttpStatus.NOT_FOUND);
    }

    const senhaValida = await this.bcrypt.compararSenhas(
      password,
      buscaUsuario.senha,
    );

    if (!senhaValida) {
      return null; // Passport tratará como falha de autenticação
    }

    const { senha, ...resposta } = buscaUsuario;
    return resposta;
  }

  // Login tradicional via body (usuário e senha)
  async login(usuarioLogin: UsuarioLogin) {
    const buscaUsuario = await this.usuarioService.findByUsuario(
      usuarioLogin.usuario,
    );

    if (!buscaUsuario) {
      throw new UnauthorizedException('Usuário e/ou senha incorretos!');
    }

    const senhaValida = await this.bcrypt.compararSenhas(
      usuarioLogin.senha,
      buscaUsuario.senha,
    );

    if (!senhaValida) {
      throw new UnauthorizedException('Usuário e/ou senha incorretos!');
    }

    const payload = { sub: usuarioLogin.usuario };

    return {
      id: buscaUsuario.id,
      nome: buscaUsuario.nome,
      usuario: usuarioLogin.usuario,
      senha: '', // nunca retornar a senha
      foto: buscaUsuario.foto,
      token: `Bearer ${this.jwtService.sign(payload)}`,
    };
  }
}
