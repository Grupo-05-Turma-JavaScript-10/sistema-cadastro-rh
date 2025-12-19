import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Colaborador } from '../entities/colaborador.entity';
import { ILike, Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';

@Injectable()
export class ColaboradorService {
  constructor(
    @InjectRepository(Colaborador)
    private colaboradorRepository: Repository<Colaborador>,
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

  async findAll(): Promise<Colaborador[]> {
    return await this.colaboradorRepository.find();
  }

  async findById(id: number): Promise<Colaborador> {
    const colaborador = await this.colaboradorRepository.findOne({
      where: {
        id,
      },
    });

    if (!colaborador)
      throw new HttpException(
        'Colaborador não encontrado',
        HttpStatus.NOT_FOUND,
      );

    return colaborador;
  }

  async findAllByNome(nome: string): Promise<Colaborador[]> {
    return await this.colaboradorRepository.find({
      where: {
        nome: ILike(`%${nome}%`),
      },
    });
  }

  async create(colaborador: Colaborador): Promise<Colaborador> {
    return await this.colaboradorRepository.save(colaborador);
  }

  async uptade(colaborador: Colaborador): Promise<Colaborador> {

    await this.findById(colaborador.id)

    return await this.colaboradorRepository.save(colaborador);
  }

  async delete(id: number): Promise<DeleteResult> {
    await this.findById(id)

    return await this.colaboradorRepository.delete(id);
  }
}
