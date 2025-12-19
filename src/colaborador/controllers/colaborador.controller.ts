import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { ColaboradorService } from '../services/colaborador.service';
import { Colaborador } from '../entities/colaborador.entity';

@Controller('/colaboradores')
export class ColaboradorController {
  constructor(private readonly colaboradorService: ColaboradorService) {}

  @Put('/calcular-salario/:id')
  calcularSalario(
    @Param('id', ParseIntPipe) id: number,
    @Body('horasTrabalhadas') horasTrabalhadas: number,
    @Body('valorHora') valorHora: number,
    @Body('bonus') bonus?: number,
    @Body('descontos') descontos?: number,
  ): Promise<number> {
    return this.colaboradorService.calcularSalario(
      id,
      horasTrabalhadas,
      valorHora,
      bonus,
      descontos,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<Colaborador[]> {
    return this.colaboradorService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Colaborador> {
    return this.colaboradorService.findById(id);
  }

  @Get('/nome/:nome')
  @HttpCode(HttpStatus.OK)
  findAllByNome(@Param('nome') nome: string): Promise<Colaborador[]> {
    return this.colaboradorService.findAllByNome(nome);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() colaborador: Colaborador): Promise<Colaborador> {
    return this.colaboradorService.create(colaborador);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  uptade(@Body() colaborador: Colaborador): Promise<Colaborador> {
    return this.colaboradorService.uptade(colaborador);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number){
    return this.colaboradorService.delete(id);
  }
}
