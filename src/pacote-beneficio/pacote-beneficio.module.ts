import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacoteBeneficio } from './entities/pacote-beneficio.entity';
import { PacoteBeneficioService } from './services/pacote-beneficio.service';
import { PacoteBeneficioController } from './controllers/pacote-beneficio.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PacoteBeneficio])],
  providers: [PacoteBeneficioService],
  controllers: [PacoteBeneficioController],
  exports: [PacoteBeneficioService],
})
export class PacoteBeneficioModule {}
