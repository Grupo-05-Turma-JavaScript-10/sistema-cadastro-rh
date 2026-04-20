import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { HistoricoService } from '../services/historico.service';
import { HistoricoColaborador } from '../entities/historico.entity';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Historico')
@UseGuards(JwtAuthGuard)
@Controller('/historico')
@ApiBearerAuth()
export class HistoricoController {
  constructor(private readonly historicoService: HistoricoService) {}

  @Get('/colaborador/:id')
  @HttpCode(HttpStatus.OK)
  findByColaboradorId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HistoricoColaborador[]> {
    return this.historicoService.findByColaboradorId(id);
  }
}
