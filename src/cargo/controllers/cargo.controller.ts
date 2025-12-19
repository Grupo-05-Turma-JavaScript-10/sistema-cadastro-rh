import { CargoService } from './../services/cargo.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Cargo } from '../entities/cargo.entity';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Cargo')
@UseGuards(JwtAuthGuard)
@Controller('/cargos')
@ApiBearerAuth()
export class CargoController {
  constructor(private readonly cargoService: CargoService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Cargo[]> {
    return this.cargoService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Cargo> {
    return this.cargoService.findById(id);
  }

  @Get('/descricao/:descricao')
  @HttpCode(HttpStatus.OK)
  findAllBydescricao(@Param('descricao') descricao: string): Promise<Cargo[]> {
    return this.cargoService.findAllByDescricao(descricao);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() Cargo: Cargo): Promise<Cargo> {
    return this.cargoService.create(Cargo);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  update(@Body() Cargo: Cargo): Promise<Cargo> {
    return this.cargoService.update(Cargo);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.cargoService.delete(id);
  }
}
