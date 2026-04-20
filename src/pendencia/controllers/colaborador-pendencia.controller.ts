import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PendenciaService } from '../services/pendencia.service';
import { Pendencia } from '../entities/pendencia.entity';

@ApiTags('Pendência')
@UseGuards(JwtAuthGuard)
@Controller('/colaboradores/:colaboradorId/pendencias')
@ApiBearerAuth()
export class ColaboradorPendenciaController {
  constructor(private readonly pendenciaService: PendenciaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAllByColaborador(
    @Param('colaboradorId', ParseIntPipe) colaboradorId: number,
  ): Promise<Pendencia[]> {
    return this.pendenciaService.findAllByColaborador(colaboradorId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('colaboradorId', ParseIntPipe) colaboradorId: number,
    @Body() pendencia: Pendencia,
  ): Promise<Pendencia> {
    return this.pendenciaService.create(colaboradorId, pendencia);
  }

  @Post('/padrao')
  @HttpCode(HttpStatus.CREATED)
  createChecklistPadrao(
    @Param('colaboradorId', ParseIntPipe) colaboradorId: number,
  ): Promise<Pendencia[]> {
    return this.pendenciaService.createChecklistPadrao(colaboradorId);
  }
}
