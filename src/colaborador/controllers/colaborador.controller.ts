import { Body, Controller, HttpCode, HttpStatus, Get, Param, ParseIntPipe, Post } from "@nestjs/common";
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

    @Get("/:id")
    @HttpCode(HttpStatus.OK)
    findById(@Param('id', ParseIntPipe) id: number): Promise<Colaborador> {
        return this.colaboradorService.findById(id);
    }

    @Get("/nome/:nome")
    @HttpCode(HttpStatus.OK)
    findAllByNome(@Param('nome') nome: string): Promise<Colaborador[]> {
        return this.colaboradorService.findAllByNome(nome);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() colaborador: Colaborador): Promise<Colaborador> {
        return this.colaboradorService.create(colaborador);
}

}