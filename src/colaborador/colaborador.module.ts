import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Colaborador } from './entities/colaborador.entity';
import { ColaboradorService } from './services/colaborador.service';
import { ColaboradorController } from './controllers/colaborador.controller';
import { HistoricoModule } from '../historico/historico.module';

@Module({
  imports: [TypeOrmModule.forFeature([Colaborador]), HistoricoModule],
  providers: [ColaboradorService],
  controllers: [ColaboradorController],
  exports: [],
})
export class ColaboradorModule {}
