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
import { PacoteBeneficioService } from '../services/pacote-beneficio.service';
import { PacoteBeneficio } from '../entities/pacote-beneficio.entity';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Pacote de Beneficios')
@UseGuards(JwtAuthGuard)
@Controller('/pacotes-beneficios')
@ApiBearerAuth()
export class PacoteBeneficioController {
  constructor(private readonly pacoteService: PacoteBeneficioService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<PacoteBeneficio[]> {
    return this.pacoteService.findAll();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<PacoteBeneficio> {
    return this.pacoteService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() pacote: PacoteBeneficio): Promise<PacoteBeneficio> {
    return this.pacoteService.create(pacote);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  update(@Body() pacote: PacoteBeneficio): Promise<PacoteBeneficio> {
    return this.pacoteService.update(pacote);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.pacoteService.delete(id);
  }
}
