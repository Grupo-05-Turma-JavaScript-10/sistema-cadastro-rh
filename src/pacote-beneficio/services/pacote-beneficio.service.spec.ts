import { Test, TestingModule } from '@nestjs/testing';
import { PacoteBeneficioService } from './pacote-beneficio.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PacoteBeneficio } from '../entities/pacote-beneficio.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

const mockPacoteRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('PacoteBeneficioService', () => {
  let service: PacoteBeneficioService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PacoteBeneficioService,
        {
          provide: getRepositoryToken(PacoteBeneficio),
          useValue: mockPacoteRepository,
        },
      ],
    }).compile();

    service = module.get<PacoteBeneficioService>(PacoteBeneficioService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar todos os pacotes de benefícios', async () => {
      const mockPacotes = [{ id: 1, plano_saude: 'Amil', vr: 500 }];
      mockPacoteRepository.find.mockResolvedValue(mockPacotes);

      const resultado = await service.findAll();

      expect(resultado).toEqual(mockPacotes);
      expect(mockPacoteRepository.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('deve retornar o pacote de benefícios se existir', async () => {
      const mockPacote = { id: 1, vr: 300 };
      mockPacoteRepository.findOne.mockResolvedValue(mockPacote);

      const resultado = await service.findById(1);

      expect(resultado).toEqual(mockPacote);
      expect(mockPacoteRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('deve lançar HttpException 404 se não for encontrado', async () => {
      mockPacoteRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(
        new HttpException('Pacote de Benefícios não encontrado', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('create', () => {
    it('deve salvar um novo pacote', async () => {
      const novoPacote = { vr: 200 } as PacoteBeneficio;
      const pacoteSalvo = { id: 1, vr: 200 };
      mockPacoteRepository.save.mockResolvedValue(pacoteSalvo);

      const resultado = await service.create(novoPacote);

      expect(resultado).toEqual(pacoteSalvo);
      expect(mockPacoteRepository.save).toHaveBeenCalledWith(novoPacote);
    });
  });

  describe('update', () => {
    it('deve atualizar o pacote se existir', async () => {
      const pacoteAtualizado = { id: 1, vr: 400 } as PacoteBeneficio;
      mockPacoteRepository.findOne.mockResolvedValue({ id: 1, vr: 200 }); // Passar no findById
      mockPacoteRepository.save.mockResolvedValue(pacoteAtualizado);

      const resultado = await service.update(pacoteAtualizado);

      expect(resultado).toEqual(pacoteAtualizado);
      expect(mockPacoteRepository.save).toHaveBeenCalledWith(pacoteAtualizado);
    });

    it('deve lançar erro se o pacote a ser atualizado não existir', async () => {
      mockPacoteRepository.findOne.mockResolvedValue(null);

      await expect(service.update({ id: 99 } as PacoteBeneficio)).rejects.toThrow(HttpException);
      expect(mockPacoteRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve deletar o pacote se existir', async () => {
      mockPacoteRepository.findOne.mockResolvedValue({ id: 1 });
      mockPacoteRepository.delete.mockResolvedValue({ affected: 1 });

      const resultado = await service.delete(1);

      expect(resultado).toEqual({ affected: 1 });
      expect(mockPacoteRepository.delete).toHaveBeenCalledWith(1);
    });

    it('deve lançar erro se o pacote a ser deletado não existir', async () => {
      mockPacoteRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(99)).rejects.toThrow(HttpException);
      expect(mockPacoteRepository.delete).not.toHaveBeenCalled();
    });
  });
});
