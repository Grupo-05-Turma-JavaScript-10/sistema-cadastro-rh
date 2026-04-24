import { Test, TestingModule } from '@nestjs/testing';
import { CargoService } from './cargo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cargo } from '../entities/cargo.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ILike } from 'typeorm';

const mockCargoRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('CargoService', () => {
  let cargoService: CargoService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CargoService,
        {
          provide: getRepositoryToken(Cargo),
          useValue: mockCargoRepository,
        },
      ],
    }).compile();

    cargoService = module.get<CargoService>(CargoService);
  });

  it('deve estar definido', () => {
    expect(cargoService).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar todos os cargos', async () => {
      const mockCargos = [{ id: 1, descricao: 'Desenvolvedor' }];
      mockCargoRepository.find.mockResolvedValue(mockCargos);

      const resultado = await cargoService.findAll();

      expect(resultado).toEqual(mockCargos);
      expect(mockCargoRepository.find).toHaveBeenCalledWith({ relations: { colaborador: true } });
    });
  });

  describe('findById', () => {
    it('deve retornar um cargo pelo ID', async () => {
      const mockCargo = { id: 1, descricao: 'QA' };
      mockCargoRepository.findOne.mockResolvedValue(mockCargo);

      const resultado = await cargoService.findById(1);

      expect(resultado).toEqual(mockCargo);
      expect(mockCargoRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: { colaborador: true } });
    });

    it('deve lançar HttpException 404 se o cargo não for encontrado', async () => {
      mockCargoRepository.findOne.mockResolvedValue(null);

      await expect(cargoService.findById(99)).rejects.toThrow(
        new HttpException('cargo não encontrado!', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('findAllByDescricao', () => {
    it('deve retornar os cargos que correspondem à descrição', async () => {
      const mockCargos = [{ id: 1, descricao: 'Tech Lead' }];
      mockCargoRepository.find.mockResolvedValue(mockCargos);

      const resultado = await cargoService.findAllByDescricao('Tech');

      expect(resultado).toEqual(mockCargos);
      expect(mockCargoRepository.find).toHaveBeenCalledWith({
        where: { descricao: ILike('%Tech%') },
        relations: { colaborador: true },
      });
    });
  });

  describe('create', () => {
    it('deve criar um cargo', async () => {
      const mockCargo = { descricao: 'Analista' } as Cargo;
      const mockSalvo = { id: 1, descricao: 'Analista' };
      mockCargoRepository.save.mockResolvedValue(mockSalvo);

      const resultado = await cargoService.create(mockCargo);

      expect(resultado).toEqual(mockSalvo);
      expect(mockCargoRepository.save).toHaveBeenCalledWith(mockCargo);
    });
  });

  describe('update', () => {
    it('deve atualizar um cargo existente', async () => {
      const mockCargoAtualizado = { id: 1, descricao: 'Senior' } as Cargo;
      mockCargoRepository.findOne.mockResolvedValue({ id: 1, descricao: 'Pleno' }); // Para passar no findById
      mockCargoRepository.save.mockResolvedValue(mockCargoAtualizado);

      const resultado = await cargoService.update(mockCargoAtualizado);

      expect(resultado).toEqual(mockCargoAtualizado);
      expect(mockCargoRepository.save).toHaveBeenCalledWith(mockCargoAtualizado);
    });

    it('deve lançar erro ao tentar atualizar cargo inexistente', async () => {
      mockCargoRepository.findOne.mockResolvedValue(null);

      await expect(cargoService.update({ id: 99 } as Cargo)).rejects.toThrow(HttpException);
      expect(mockCargoRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve deletar um cargo existente', async () => {
      mockCargoRepository.findOne.mockResolvedValue({ id: 1 });
      mockCargoRepository.delete.mockResolvedValue({ affected: 1 });

      const resultado = await cargoService.delete(1);

      expect(resultado).toEqual({ affected: 1 });
      expect(mockCargoRepository.delete).toHaveBeenCalledWith(1);
    });

    it('deve lançar erro ao deletar cargo inexistente', async () => {
      mockCargoRepository.findOne.mockResolvedValue(null);

      await expect(cargoService.delete(99)).rejects.toThrow(HttpException);
      expect(mockCargoRepository.delete).not.toHaveBeenCalled();
    });
  });
});
