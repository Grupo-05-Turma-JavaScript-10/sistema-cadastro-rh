import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Colaborador } from './colaborador/entities/colaborador.entity';
import { ColaboradorModule } from './colaborador/colaborador.module';
import { Cargo } from './cargo/entities/cargo.entity';
import { CargoModule } from './cargo/cargo.module';
import { AuthModule } from './auth/auth.module';
import { Usuario } from './usuario/entities/usuario.entity';
import { UsuarioModule } from './usuario/usuario.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProdService } from './data/services/prod.service';
import { DevService } from './data/services/dev.service';
import { PendenciaModule } from './pendencia/pendencia.module';
import { HistoricoModule } from './historico/historico.module';
import { PacoteBeneficioModule } from './pacote-beneficio/pacote-beneficio.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useClass: process.env.NODE_ENV === 'production' ? ProdService : DevService,
      imports: [ConfigModule],
    }),

    ColaboradorModule,
    CargoModule,
    AuthModule,
    UsuarioModule,
    PendenciaModule,
    HistoricoModule,
    PacoteBeneficioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
