import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoricoColaborador } from './entities/historico.entity';
import { HistoricoService } from './services/historico.service';
import { HistoricoController } from './controllers/historico.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HistoricoColaborador])],
  providers: [HistoricoService],
  controllers: [HistoricoController],
  exports: [HistoricoService],
})
export class HistoricoModule {}
