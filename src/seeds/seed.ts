import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bcrypt } from '../auth/bcrypt/bcrypt';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Cargo } from '../cargo/entities/cargo.entity';
import { Colaborador } from '../colaborador/entities/colaborador.entity';

async function run() {
  const app = await NestFactory.create(AppModule);
  await app.init();

  const usuarioRepo = app.get<Repository<Usuario>>(getRepositoryToken(Usuario));
  const cargoRepo = app.get<Repository<Cargo>>(getRepositoryToken(Cargo));
  const colaboradorRepo = app.get<Repository<Colaborador>>(getRepositoryToken(Colaborador));
  const bcrypt = app.get<Bcrypt>(Bcrypt);

  const cargoNomes = [
    { nome: 'Desenvolvedor', descricao: 'Desenvolvimento' },
    { nome: 'Analista RH', descricao: 'Recursos Humanos' },
    { nome: 'Gestor de Projetos', descricao: 'Gerenciamento de projetos' },
    { nome: 'Designer', descricao: 'Design e UX' },
    { nome: 'QA', descricao: 'Qualidade e testes' },
    { nome: 'DevOps', descricao: 'Infraestrutura e CI/CD' },
    { nome: 'Financeiro', descricao: 'Contas e finanças' },
    { nome: 'Marketing', descricao: 'Marketing e comunicação' },
  ];
  const cargos: Cargo[] = [];
  for (const c of cargoNomes) {
    let cargo = await cargoRepo.findOne({ where: { nome: c.nome } });
    if (!cargo) {
      cargo = await cargoRepo.save({ nome: c.nome, descricao: c.descricao });
    }
    cargos.push(cargo);
  }

  let usuarioAdmin = await usuarioRepo.findOne({ where: { usuario: 'admin@empresa.com' } });
  if (!usuarioAdmin) {
    const senhaHash = await bcrypt.criptografarSenha('senha12345');
    usuarioAdmin = await usuarioRepo.save({
      nome: 'Admin',
      usuario: 'admin@empresa.com',
      senha: senhaHash,
      foto: '',
    });
  }

  let usuarioRoot = await usuarioRepo.findOne({ where: { usuario: 'root@root.com.br' } });
  if (!usuarioRoot) {
    const senhaHashRoot = await bcrypt.criptografarSenha('rootroot');
    usuarioRoot = await usuarioRepo.save({
      nome: 'Root',
      usuario: 'root@root.com.br',
      senha: senhaHashRoot,
      foto: '',
    });
  }

  const nomes = [
    'João da Silva',
    'Maria Oliveira',
    'Carlos Souza',
    'Ana Pereira',
    'Bruno Lima',
    'Fernanda Alves',
    'Ricardo Santos',
    'Patrícia Gomes',
    'Lucas Rocha',
    'Mariana Costa',
  ];
  for (let i = 0; i < nomes.length; i++) {
    const numero = (i + 1).toString().padStart(2, '0');
    const cpf = `000.000.000-${numero}`;
    const emailBase = nomes[i].toLowerCase().replace(/\s+/g, '.');
    const email = `${emailBase}@empresa.com`;
    const existe = await colaboradorRepo.findOne({ where: { cpf } });
    if (!existe) {
      const cargo = cargos[i % cargos.length];
      const usuario = i % 2 === 0 ? usuarioRoot : usuarioAdmin;
      const salario = 2500 + i * 150;
      await colaboradorRepo.save({
        nome: nomes[i],
        cpf,
        email,
        data_admissao: new Date(),
        salario,
        status: true,
        cargo,
        usuario,
      });
    }
  }

  await app.close();
}

run();
