import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, ILike, Repository } from 'typeorm';
import { Cargo } from '../entities/cargo.entity';

@Injectable()
export class CargoService {
  constructor(
    @InjectRepository(Cargo)
    private cargoRepository: Repository<Cargo>,
  ) {}

  async findAll(): Promise<Cargo[]> {
    return await this.cargoRepository.find({
      relations: {
        colaborador: true,
      },
    });
  }

  async findById(id: number): Promise<Cargo> {
    const cargo = await this.cargoRepository.findOne({
      where: {
        id,
      },
      relations: {
        colaborador: true,
      },
    });

    if (!cargo)
      throw new HttpException('cargo não encontrado!', HttpStatus.NOT_FOUND);

    return cargo;
  }

  async findAllByDescricao(descricao: string): Promise<Cargo[]> {
    return await this.cargoRepository.find({
      where: {
        descricao: ILike(`%${descricao}%`),
      },
      relations: {
        colaborador: true,
      },
    });
  }

  async create(cargo: Cargo): Promise<Cargo> {
    return await this.cargoRepository.save(cargo);
  }

  async update(cargo: Cargo): Promise<Cargo> {
    await this.findById(cargo.id);

    return await this.cargoRepository.save(cargo);
  }

  async delete(id: number): Promise<DeleteResult> {
    await this.findById(id);

    return await this.cargoRepository.delete(id);
  }
}
