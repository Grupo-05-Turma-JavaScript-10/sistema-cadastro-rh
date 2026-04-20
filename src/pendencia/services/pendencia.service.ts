import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { Pendencia } from '../entities/pendencia.entity';
import { Colaborador } from '../../colaborador/entities/colaborador.entity';

@Injectable()
export class PendenciaService {
  constructor(
    @InjectRepository(Pendencia)
    private pendenciaRepository: Repository<Pendencia>,
    @InjectRepository(Colaborador)
    private colaboradorRepository: Repository<Colaborador>,
  ) {}

  private async getColaborador(colaboradorId: number): Promise<Colaborador> {
    const colaborador = await this.colaboradorRepository.findOne({
      where: { id: colaboradorId },
    });

    if (!colaborador)
      throw new HttpException(
        'Colaborador não encontrado',
        HttpStatus.NOT_FOUND,
      );

    return colaborador;
  }

  async findById(id: number): Promise<Pendencia> {
    const pendencia = await this.pendenciaRepository.findOne({
      where: { id },
      relations: { colaborador: true },
    });

    if (!pendencia)
      throw new HttpException('Pendência não encontrada', HttpStatus.NOT_FOUND);

    return pendencia;
  }

  async findAll(params?: {
    colaboradorId?: number;
    concluida?: boolean;
  }): Promise<Pendencia[]> {
    const where: any = {};

    if (params?.colaboradorId !== undefined) {
      where.colaborador = { id: params.colaboradorId };
    }

    if (params?.concluida !== undefined) {
      where.concluida = params.concluida;
    }

    return await this.pendenciaRepository.find({
      where,
      relations: { colaborador: true },
      order: { concluida: 'ASC', obrigatoria: 'DESC', createdAt: 'DESC' },
    });
  }

  async findAllByColaborador(colaboradorId: number): Promise<Pendencia[]> {
    await this.getColaborador(colaboradorId);

    return await this.pendenciaRepository.find({
      where: { colaborador: { id: colaboradorId } },
      relations: { colaborador: true },
      order: { concluida: 'ASC', obrigatoria: 'DESC', createdAt: 'DESC' },
    });
  }

  async create(
    colaboradorId: number,
    pendencia: Pendencia,
  ): Promise<Pendencia> {
    const colaborador = await this.getColaborador(colaboradorId);

    const toSave = this.pendenciaRepository.create({
      ...pendencia,
      colaborador,
    });

    if (toSave.concluida && !toSave.dataConclusao) {
      toSave.dataConclusao = new Date();
    }

    if (!toSave.concluida) {
      toSave.dataConclusao = null;
    }

    return await this.pendenciaRepository.save(toSave);
  }

  async createChecklistPadrao(colaboradorId: number): Promise<Pendencia[]> {
    const colaborador = await this.getColaborador(colaboradorId);

    const titulosPadrao = [
      'Documento de identidade (RG)',
      'CPF',
      'CTPS',
      'Comprovante de residência',
      'Dados bancários',
      'ASO (Atestado de Saúde Ocupacional)',
    ];

    const existentes = await this.pendenciaRepository.find({
      where: { colaborador: { id: colaboradorId } },
      select: { titulo: true, id: true },
    });

    const existentesSet = new Set(
      existentes.map((p) => p.titulo.trim().toLowerCase()),
    );

    const faltantes = titulosPadrao.filter(
      (t) => !existentesSet.has(t.trim().toLowerCase()),
    );

    if (faltantes.length > 0) {
      await this.pendenciaRepository.save(
        faltantes.map((titulo) =>
          this.pendenciaRepository.create({
            titulo,
            obrigatoria: true,
            concluida: false,
            colaborador,
          }),
        ),
      );
    }

    return await this.findAllByColaborador(colaboradorId);
  }

  async update(pendencia: Pendencia): Promise<Pendencia> {
    const existente = await this.findById(pendencia.id);
    const merged = this.pendenciaRepository.merge(existente, pendencia);

    if (merged.concluida && !merged.dataConclusao) {
      merged.dataConclusao = new Date();
    }

    if (!merged.concluida) {
      merged.dataConclusao = null;
    }

    return await this.pendenciaRepository.save(merged);
  }

  async delete(id: number): Promise<DeleteResult> {
    await this.findById(id);

    return await this.pendenciaRepository.delete(id);
  }
}
