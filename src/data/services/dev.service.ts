import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Colaborador } from '../../colaborador/entities/colaborador.entity';
import { Cargo } from '../../cargo/entities/cargo.entity';
import { Pendencia } from '../../pendencia/entities/pendencia.entity';
import { HistoricoColaborador } from '../../historico/entities/historico.entity';
import { PacoteBeneficio } from '../../pacote-beneficio/entities/pacote-beneficio.entity';

@Injectable()
export class DevService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'db_rh',
      entities: [Colaborador, Cargo, Usuario, Pendencia, HistoricoColaborador, PacoteBeneficio],
      synchronize: true,
    };
  }
}
