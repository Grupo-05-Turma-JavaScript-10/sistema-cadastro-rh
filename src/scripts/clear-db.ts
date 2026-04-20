import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Colaborador } from '../colaborador/entities/colaborador.entity';
import { Cargo } from '../cargo/entities/cargo.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Pendencia } from '../pendencia/entities/pendencia.entity';
import { HistoricoColaborador } from '../historico/entities/historico.entity';
import { PacoteBeneficio } from '../pacote-beneficio/entities/pacote-beneficio.entity';

async function run() {
  const app = await NestFactory.create(AppModule);
  await app.init();

  const colaboradorRepo = app.get<Repository<Colaborador>>(
    getRepositoryToken(Colaborador),
  );
  const cargoRepo = app.get<Repository<Cargo>>(getRepositoryToken(Cargo));
  const usuarioRepo = app.get<Repository<Usuario>>(
    getRepositoryToken(Usuario),
  );
  const pendenciaRepo = app.get<Repository<Pendencia>>(
    getRepositoryToken(Pendencia),
  );
  const historicoRepo = app.get<Repository<HistoricoColaborador>>(
    getRepositoryToken(HistoricoColaborador),
  );
  const pacoteRepo = app.get<Repository<PacoteBeneficio>>(
    getRepositoryToken(PacoteBeneficio),
  );
  const dataSource = app.get(DataSource);
  const driver = (dataSource.options as any)?.type;

  if (driver === 'mysql' || driver === 'mariadb') {
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
    await dataSource.query('TRUNCATE TABLE tb_historico_colaborador');
    await dataSource.query('TRUNCATE TABLE tb_pendencias');
    await dataSource.query('TRUNCATE TABLE tb_colaboradores');
    await dataSource.query('TRUNCATE TABLE tb_pacotes_beneficios');
    await dataSource.query('TRUNCATE TABLE tb_cargos');
    await dataSource.query('TRUNCATE TABLE tb_usuarios');
    await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
  } else if (driver === 'postgres') {
    await dataSource.query(
      'TRUNCATE TABLE "tb_historico_colaborador", "tb_pendencias", "tb_colaboradores", "tb_pacotes_beneficios", "tb_cargos", "tb_usuarios" RESTART IDENTITY CASCADE',
    );
  } else {
    await historicoRepo.createQueryBuilder().delete().execute();
    await pendenciaRepo.createQueryBuilder().delete().execute();
    await colaboradorRepo.createQueryBuilder().delete().execute();
    await pacoteRepo.createQueryBuilder().delete().execute();
    await cargoRepo.createQueryBuilder().delete().execute();
    await usuarioRepo.createQueryBuilder().delete().execute();
  }

  await app.close();
}

run();
