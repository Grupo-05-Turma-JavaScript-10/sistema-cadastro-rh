import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pendencia } from './entities/pendencia.entity';
import { PendenciaService } from './services/pendencia.service';
import { PendenciaController } from './controllers/pendencia.controller';
import { ColaboradorPendenciaController } from './controllers/colaborador-pendencia.controller';
import { Colaborador } from '../colaborador/entities/colaborador.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pendencia, Colaborador])],
  providers: [PendenciaService],
  controllers: [PendenciaController, ColaboradorPendenciaController],
  exports: [],
})
export class PendenciaModule {}
