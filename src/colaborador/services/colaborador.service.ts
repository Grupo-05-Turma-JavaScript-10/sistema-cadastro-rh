import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Colaborador } from '../entities/colaborador.entity';
import { ILike, Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { HistoricoService } from '../../historico/services/historico.service';

@Injectable()
export class ColaboradorService {
  constructor(
    @InjectRepository(Colaborador)
    private colaboradorRepository: Repository<Colaborador>,
    private historicoService: HistoricoService,
  ) {}

  async calcularSalario(
    id: number,
    horasTrabalhadas: number,
    valorHora: number,
    bonus = 0,
    descontos = 0,
  ): Promise<number> {
    const salarioCalculado = horasTrabalhadas * valorHora + bonus - descontos;

    await this.colaboradorRepository.update(id, {
      salario: salarioCalculado,
    });

    return salarioCalculado;
  }

  private adicionarCamposCalculados(colaborador: Colaborador): any {
    const salarioBruto = Number(colaborador.salario) || 0;
    const valorBeneficios = colaborador.pacoteBeneficio ? Number(colaborador.pacoteBeneficio.valorTotal) : 0;
    
    let encargos = 0;
    const tipo = colaborador.tipoContrato?.toUpperCase() || 'CLT';

    if (tipo === 'CLT') {
      // Cálculo CLT: FGTS (8%) + INSS Patronal (~20%) + Provisão Férias (1/12 + 1/3) + Provisão 13º (1/12) + Reflexos
      // Isso dá em torno de 68% do salário bruto.
      encargos = salarioBruto * 0.68;
    } else if (tipo === 'ESTAGIO') {
      // Estágio não tem FGTS nem INSS. Tem apenas provisão de recesso (férias sem 1/3).
      // Aproximadamente 8.33% (1/12 do salário).
      encargos = salarioBruto * 0.0833;
    } else if (tipo === 'PJ') {
      // PJ o encargo é zero. A empresa paga apenas o valor da NF.
      encargos = 0;
    }

    const custoTotal = salarioBruto + encargos + valorBeneficios;

    return {
      ...colaborador,
      encargos: Number(encargos.toFixed(2)),
      custoTotal: Number(custoTotal.toFixed(2)),
    };
  }

  async findAll(): Promise<any[]> {
    const colaboradores = await this.colaboradorRepository.find({
      relations: {
        cargo: true,
        usuario: true,
        pacoteBeneficio: true,
      },
    });
    return colaboradores.map(c => this.adicionarCamposCalculados(c));
  }

  async findById(id: number): Promise<any> {
    const colaborador = await this.colaboradorRepository.findOne({
      where: {
        id,
      },
      relations: {
        cargo: true,
        usuario: true,
        pacoteBeneficio: true,
      },
    });

    if (!colaborador)
      throw new HttpException(
        'Colaborador não encontrado',
        HttpStatus.NOT_FOUND,
      );

    return this.adicionarCamposCalculados(colaborador);
  }

  async findAllByNome(nome: string): Promise<any[]> {
    const colaboradores = await this.colaboradorRepository.find({
      where: {
        nome: ILike(`%${nome}%`),
      },
      relations: {
        cargo: true,
        usuario: true,
        pacoteBeneficio: true,
      },
    });
    return colaboradores.map(c => this.adicionarCamposCalculados(c));
  }

  async create(colaborador: Colaborador): Promise<Colaborador> {
    if (colaborador.data_admissao) {
      const admissao = new Date(colaborador.data_admissao);
      if (!colaborador.dataFimExperiencia) {
        colaborador.dataFimExperiencia = new Date(admissao);
        colaborador.dataFimExperiencia.setDate(admissao.getDate() + 90);
      }
      if (!colaborador.dataVencimentoAso) {
        colaborador.dataVencimentoAso = new Date(admissao);
        colaborador.dataVencimentoAso.setFullYear(admissao.getFullYear() + 1);
      }
      if (!colaborador.dataLimiteFerias) {
        colaborador.dataLimiteFerias = new Date(admissao);
        colaborador.dataLimiteFerias.setFullYear(admissao.getFullYear() + 1);
        colaborador.dataLimiteFerias.setMonth(admissao.getMonth() + 11);
      }
    }
    return await this.colaboradorRepository.save(colaborador);
  }

  async uptade(colaborador: Colaborador): Promise<Colaborador> {
    const colaboradorExistente = await this.findById(colaborador.id);

    const cargoAlterado = colaborador.cargo && colaboradorExistente.cargo && colaboradorExistente.cargo.id !== colaborador.cargo.id;
    const salarioAlterado = colaborador.salario && Number(colaboradorExistente.salario) !== Number(colaborador.salario);

    if (cargoAlterado || salarioAlterado) {
      const motivo = cargoAlterado && salarioAlterado ? 'Promoção' : (cargoAlterado ? 'Mudança de Cargo' : 'Reajuste Salarial');
      await this.historicoService.registrarHistorico(
        colaboradorExistente,
        colaboradorExistente.cargo,
        colaborador.cargo || colaboradorExistente.cargo,
        colaboradorExistente.salario,
        colaborador.salario || colaboradorExistente.salario,
        motivo,
      );
    }

    return await this.colaboradorRepository.save(colaborador);
  }

  async delete(id: number): Promise<DeleteResult> {
    await this.findById(id);

    return await this.colaboradorRepository.delete(id);
  }

  async getAlertasVencimentos(dias: number = 30): Promise<any[]> {
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() + dias);

    const colaboradores = await this.colaboradorRepository.find({
      where: { status: true },
    });

    const alertas: any[] = [];

    colaboradores.forEach((colab) => {
      if (colab.dataFimExperiencia && new Date(colab.dataFimExperiencia) >= hoje && new Date(colab.dataFimExperiencia) <= dataLimite) {
        const diasRestantes = Math.ceil((new Date(colab.dataFimExperiencia).getTime() - hoje.getTime()) / (1000 * 3600 * 24));
        alertas.push({ id: colab.id, nome: colab.nome, tipoAlerta: 'Experiência vencendo', diasRestantes, data: colab.dataFimExperiencia });
      }
      if (colab.dataVencimentoAso && new Date(colab.dataVencimentoAso) >= hoje && new Date(colab.dataVencimentoAso) <= dataLimite) {
        const diasRestantes = Math.ceil((new Date(colab.dataVencimentoAso).getTime() - hoje.getTime()) / (1000 * 3600 * 24));
        alertas.push({ id: colab.id, nome: colab.nome, tipoAlerta: 'ASO vencendo', diasRestantes, data: colab.dataVencimentoAso });
      }
      if (colab.dataLimiteFerias && new Date(colab.dataLimiteFerias) >= hoje && new Date(colab.dataLimiteFerias) <= dataLimite) {
        const diasRestantes = Math.ceil((new Date(colab.dataLimiteFerias).getTime() - hoje.getTime()) / (1000 * 3600 * 24));
        alertas.push({ id: colab.id, nome: colab.nome, tipoAlerta: 'Limite para Férias', diasRestantes, data: colab.dataLimiteFerias });
      }
    });

    return alertas.sort((a, b) => a.diasRestantes - b.diasRestantes);
  }
}
