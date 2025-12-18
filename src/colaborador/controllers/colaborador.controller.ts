import { Controller, HttpCode, HttpStatus, Get } from "@nestjs/common";
import { ColaboradorService } from "../services/colaborador.service";
import { Colaborador } from "../entities/colaborador.entity";

@Controller("/colaboradores")
export class ColaboradorController {
    constructor(private readonly colaboradorService: ColaboradorService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    findAll(): Promise<Colaborador[]> {
        return this.colaboradorService.findAll();
    }
}