import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoricoColaborador } from '../entities/historico.entity';
import { Colaborador } from '../../colaborador/entities/colaborador.entity';
import { Cargo } from '../../cargo/entities/cargo.entity';

@Injectable()
export class HistoricoService {
  constructor(
    @InjectRepository(HistoricoColaborador)
    private historicoRepository: Repository<HistoricoColaborador>,
  ) {}

  async registrarHistorico(
    colaborador: Colaborador,
    cargoAnterior: Cargo | null,
    cargoNovo: Cargo | null,
    salarioAnterior: number | null,
    salarioNovo: number | null,
    motivo: string,
  ): Promise<HistoricoColaborador> {
    const historico = new HistoricoColaborador();
    historico.colaborador = colaborador;
    historico.cargoAnterior = cargoAnterior as Cargo;
    historico.cargoNovo = cargoNovo as Cargo;
    historico.salarioAnterior = salarioAnterior as number;
    historico.salarioNovo = salarioNovo as number;
    historico.motivo = motivo;

    return await this.historicoRepository.save(historico);
  }

  async findByColaboradorId(colaboradorId: number): Promise<HistoricoColaborador[]> {
    return await this.historicoRepository.find({
      where: { colaborador: { id: colaboradorId } },
      relations: {
        cargoAnterior: true,
        cargoNovo: true,
      },
      order: {
        dataAlteracao: 'DESC',
      },
    });
  }
}
