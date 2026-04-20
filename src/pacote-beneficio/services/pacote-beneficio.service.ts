import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PacoteBeneficio } from '../entities/pacote-beneficio.entity';
import { DeleteResult } from 'typeorm/browser';

@Injectable()
export class PacoteBeneficioService {
  constructor(
    @InjectRepository(PacoteBeneficio)
    private pacoteRepository: Repository<PacoteBeneficio>,
  ) {}

  async findAll(): Promise<PacoteBeneficio[]> {
    return await this.pacoteRepository.find();
  }

  async findById(id: number): Promise<PacoteBeneficio> {
    const pacote = await this.pacoteRepository.findOne({
      where: { id },
    });

    if (!pacote)
      throw new HttpException(
        'Pacote de Benefícios não encontrado',
        HttpStatus.NOT_FOUND,
      );

    return pacote;
  }

  async create(pacote: PacoteBeneficio): Promise<PacoteBeneficio> {
    return await this.pacoteRepository.save(pacote);
  }

  async update(pacote: PacoteBeneficio): Promise<PacoteBeneficio> {
    await this.findById(pacote.id);
    return await this.pacoteRepository.save(pacote);
  }

  async delete(id: number): Promise<DeleteResult> {
    await this.findById(id);
    return await this.pacoteRepository.delete(id);
  }
}
