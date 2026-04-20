import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bcrypt } from '../auth/bcrypt/bcrypt';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Cargo } from '../cargo/entities/cargo.entity';
import { Colaborador } from '../colaborador/entities/colaborador.entity';
import { Pendencia } from '../pendencia/entities/pendencia.entity';
import { PacoteBeneficio } from '../pacote-beneficio/entities/pacote-beneficio.entity';

async function run() {
  const app = await NestFactory.create(AppModule);
  await app.init();

  const usuarioRepo = app.get<Repository<Usuario>>(getRepositoryToken(Usuario));
  const cargoRepo = app.get<Repository<Cargo>>(getRepositoryToken(Cargo));
  const colaboradorRepo = app.get<Repository<Colaborador>>(
    getRepositoryToken(Colaborador),
  );
  const pendenciaRepo = app.get<Repository<Pendencia>>(
    getRepositoryToken(Pendencia),
  );
  const pacoteRepo = app.get<Repository<PacoteBeneficio>>(getRepositoryToken(PacoteBeneficio));
  const bcrypt = app.get<Bcrypt>(Bcrypt);

  const pacotesNomes = [
    { nome: 'Pacote Estágio', descricao: 'Apenas Vale Transporte', valorTotal: 150.00 },
    { nome: 'Pacote Básico', descricao: 'VT + VR', valorTotal: 500.00 },
    { nome: 'Pacote Pleno', descricao: 'VT + VR + Plano de Saúde', valorTotal: 1200.00 },
    { nome: 'Pacote Executivo', descricao: 'Benefícios Premium', valorTotal: 2500.00 },
  ];
  const pacotes: PacoteBeneficio[] = [];
  for (const p of pacotesNomes) {
    let pacote = await pacoteRepo.findOne({ where: { nome: p.nome } });
    if (!pacote) {
      pacote = await pacoteRepo.save(p);
    }
    pacotes.push(pacote);
  }

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
    let colaborador = await colaboradorRepo.findOne({ where: { cpf } });
    if (!colaborador) {
      const cargo = cargos[i % cargos.length];
      const usuario = i % 2 === 0 ? usuarioRoot : usuarioAdmin;
      const pacoteBeneficio = pacotes[i % pacotes.length];
      const salario = 2500 + i * 150;
      
      const admissao = new Date();
      admissao.setMonth(admissao.getMonth() - (i % 5));

      const fimExperiencia = new Date(admissao);
      fimExperiencia.setDate(admissao.getDate() + 90);

      colaborador = await colaboradorRepo.save({
        nome: nomes[i],
        cpf,
        email,
        data_admissao: admissao,
        dataFimExperiencia: fimExperiencia,
        salario,
        status: true,
        tipoContrato: i % 3 === 0 ? 'PJ' : (i % 4 === 0 ? 'ESTAGIO' : 'CLT'),
        cargo,
        usuario,
        pacoteBeneficio,
      });
    }

    const pendenciasExistentes = await pendenciaRepo.count({
      where: { colaborador: { id: colaborador.id } },
    });

    if (pendenciasExistentes === 0) {
      const titulosPadrao = [
        'Documento de identidade (RG)',
        'CPF',
        'CTPS',
        'Comprovante de residência',
        'Dados bancários',
        'ASO (Atestado de Saúde Ocupacional)',
      ];

      await pendenciaRepo.save(
        titulosPadrao.map((titulo) =>
          pendenciaRepo.create({
            titulo,
            obrigatoria: true,
            concluida: false,
            colaborador,
          }),
        ),
      );
    }
  }

  await app.close();
}

run();
