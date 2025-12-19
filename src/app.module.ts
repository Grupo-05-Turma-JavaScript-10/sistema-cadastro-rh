import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Colaborador } from './colaborador/entities/colaborador.entity';
import { ColaboradorModule } from './colaborador/colaborador.module';
import { Cargo } from './cargo/entities/cargo.entity';
import { CargoModule } from './cargo/cargo.module';
import { AuthModule } from './auth/auth.module';
import { Usuario } from './usuario/entities/usuario.entity';
import { UsuarioModule } from './usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'db_rh',
      entities: [Colaborador, Cargo, Usuario],
      synchronize: true,
    }),
    ColaboradorModule,
    CargoModule,
    AuthModule,
    UsuarioModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
