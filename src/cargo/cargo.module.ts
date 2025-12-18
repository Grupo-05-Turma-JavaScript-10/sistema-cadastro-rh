import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cargo } from './entities/cargo.entity';
import { CargoService } from './services/cargo.service';
import { CargoController } from './controllers/cargo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cargo])],
  providers: [CargoService],
  controllers: [CargoController],
  exports: [CargoService],
})
export class CargoModule {}
