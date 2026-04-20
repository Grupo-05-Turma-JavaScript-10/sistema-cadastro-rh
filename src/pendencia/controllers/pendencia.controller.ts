import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PendenciaService } from '../services/pendencia.service';
import { Pendencia } from '../entities/pendencia.entity';

@ApiTags('Pendência')
@UseGuards(JwtAuthGuard)
@Controller('/pendencias')
@ApiBearerAuth()
export class PendenciaController {
  constructor(private readonly pendenciaService: PendenciaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Query('colaboradorId') colaboradorId?: string,
    @Query('concluida') concluida?: string,
  ): Promise<Pendencia[]> {
    const params: { colaboradorId?: number; concluida?: boolean } = {};

    if (colaboradorId !== undefined) {
      const parsed = Number(colaboradorId);
      if (!Number.isNaN(parsed)) params.colaboradorId = parsed;
    }

    if (concluida !== undefined) {
      if (concluida === 'true') params.concluida = true;
      if (concluida === 'false') params.concluida = false;
    }

    return this.pendenciaService.findAll(params);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<Pendencia> {
    return this.pendenciaService.findById(id);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  update(@Body() pendencia: Pendencia): Promise<Pendencia> {
    return this.pendenciaService.update(pendencia);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.pendenciaService.delete(id);
  }
}
