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
  UseGuards,
  Header,
} from '@nestjs/common';
import { ColaboradorService } from '../services/colaborador.service';
import { Colaborador } from '../entities/colaborador.entity';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';

@ApiTags('Colaborador')
@UseGuards(JwtAuthGuard)
@Controller('/colaboradores')
@ApiBearerAuth()
export class ColaboradorController {
  constructor(private readonly colaboradorService: ColaboradorService) {}

  @Put('/calcular-salario/:id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        horasTrabalhadas: { type: 'number' },
        valorHora: { type: 'number' },
        bonus: { type: 'number' },
        descontos: { type: 'number' },
      },
      required: ['horasTrabalhadas', 'valorHora'],
    },
  })
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
  findAll(): Promise<any[]> {
    return this.colaboradorService.findAll();
  }

  @Get('/alertas/vencimentos')
  @HttpCode(HttpStatus.OK)
  getAlertasVencimentos(): Promise<any[]> {
    return this.colaboradorService.getAlertasVencimentos(45); // alertas para os próximos 45 dias
  }

  @Get('/exportar/csv')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=colaboradores.csv')
  async exportarCsv(): Promise<string> {
    const colaboradores = await this.colaboradorService.findAll();
    const headers = ['ID', 'Nome', 'CPF', 'Email', 'Data Admissão', 'Status', 'Tipo Contrato', 'Cargo', 'Salário Bruto', 'Pacote Benefícios', 'Encargos', 'Custo Total'];
    const rows = colaboradores.map(c => {
      const salarioBruto = Number(c.salario) || 0;
      const valorBeneficios = c.pacoteBeneficio ? Number(c.pacoteBeneficio.valorTotal) : 0;
      
      return [
        c.id,
        c.nome,
        c.cpf,
        c.email,
        c.data_admissao,
        c.status ? 'Ativo' : 'Inativo',
        c.tipoContrato || 'CLT',
        c.cargo?.nome || '',
        salarioBruto.toFixed(2),
        valorBeneficios.toFixed(2),
        c.encargos.toFixed(2),
        c.custoTotal.toFixed(2)
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  findById(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.colaboradorService.findById(id);
  }

  @Get('/nome/:nome')
  @HttpCode(HttpStatus.OK)
  findAllByNome(@Param('nome') nome: string): Promise<any[]> {
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
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.colaboradorService.delete(id);
  }
}
