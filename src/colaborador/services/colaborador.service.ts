import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Colaborador } from "../entities/colaborador.entity";
import { Repository } from "typeorm";

@Injectable()
export class ColaboradorService {
    constructor(
        @InjectRepository(Colaborador)
        private colaboradorRepository: Repository<Colaborador>
    ) {}

    async findAll(): Promise<Colaborador[]> {
        return await this.colaboradorRepository.find();
    }

    async findById(id: number): Promise <Colaborador> {

        const colaborador = await this.colaboradorRepository.findOne({ 
            where: { 
                id 
            }
     });

     if (!colaborador) 
        throw new HttpException('Colaborador não encontrado', HttpStatus.NOT_FOUND);

        return colaborador;
    }
}
