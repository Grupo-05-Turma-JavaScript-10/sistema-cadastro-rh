import { Test, TestingModule } from '@nestjs/testing';
import { PendenciaService } from './pendencia.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Pendencia } from '../entities/pendencia.entity';
import { Colaborador } from '../../colaborador/entities/colaborador.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

const mockPendenciaRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
};

const mockColaboradorRepository = {
  findOne: jest.fn(),
};

describe('PendenciaService', () => {
  let service: PendenciaService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PendenciaService,
        {
          provide: getRepositoryToken(Pendencia),
          useValue: mockPendenciaRepository,
        },
        {
          provide: getRepositoryToken(Colaborador),
          useValue: mockColaboradorRepository,
        },
      ],
    }).compile();

    service = module.get<PendenciaService>(PendenciaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('deve retornar uma pendência se existir', async () => {
      const mockPendencia = { id: 1, titulo: 'Documento' };
      mockPendenciaRepository.findOne.mockResolvedValue(mockPendencia);

      const resultado = await service.findById(1);

      expect(resultado).toEqual(mockPendencia);
      expect(mockPendenciaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { colaborador: true },
      });
    });

    it('deve lançar HttpException 404 se a pendência não existir', async () => {
      mockPendenciaRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(
        new HttpException('Pendência não encontrada', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('create', () => {
    it('deve criar uma nova pendência com dataConclusao se concluida for true', async () => {
      const colaboradorMock = { id: 1 } as Colaborador;
      const pendenciaMock = { titulo: 'RG', concluida: true } as Pendencia;
      
      mockColaboradorRepository.findOne.mockResolvedValue(colaboradorMock);
      mockPendenciaRepository.create.mockReturnValue({ ...pendenciaMock, colaborador: colaboradorMock });
      mockPendenciaRepository.save.mockImplementation((val) => Promise.resolve({ id: 1, ...val }));

      const resultado = await service.create(1, pendenciaMock);

      expect(resultado.dataConclusao).toBeDefined();
      expect(mockPendenciaRepository.save).toHaveBeenCalled();
    });
  });

  describe('createChecklistPadrao', () => {
    it('deve criar checklist apenas com itens faltantes', async () => {
      const colaboradorMock = { id: 1 } as Colaborador;
      mockColaboradorRepository.findOne.mockResolvedValue(colaboradorMock);
      
      // Simulando que o colaborador já tem 'CPF'
      mockPendenciaRepository.find.mockResolvedValueOnce([{ id: 1, titulo: 'CPF' }]);
      mockPendenciaRepository.create.mockImplementation((val) => val);
      mockPendenciaRepository.save.mockResolvedValue([]);
      
      // Mock para o findAllByColaborador
      mockPendenciaRepository.find.mockResolvedValueOnce([
        { id: 1, titulo: 'CPF' },
        { id: 2, titulo: 'CTPS' },
      ]);

      const resultado = await service.createChecklistPadrao(1);

      expect(mockPendenciaRepository.save).toHaveBeenCalled();
      const itensSalvos = mockPendenciaRepository.save.mock.calls[0][0];
      
      // CPF já existia, não deve estar na lista de salvos
      expect(itensSalvos.find((i: any) => i.titulo === 'CPF')).toBeUndefined();
      // CTPS não existia, deve ser salvo
      expect(itensSalvos.find((i: any) => i.titulo === 'CTPS')).toBeDefined();
      expect(resultado.length).toBe(2);
    });
  });

  describe('update', () => {
    it('deve atualizar e remover dataConclusao se concluida for false', async () => {
      const pendenciaExistente = { id: 1, concluida: true, dataConclusao: new Date() };
      const pendenciaAtualizada = { id: 1, concluida: false } as Pendencia;
      const merged = { ...pendenciaExistente, ...pendenciaAtualizada };

      mockPendenciaRepository.findOne.mockResolvedValue(pendenciaExistente); // Para findById
      mockPendenciaRepository.merge.mockReturnValue(merged);
      mockPendenciaRepository.save.mockImplementation((val) => Promise.resolve(val));

      const resultado = await service.update(pendenciaAtualizada);

      expect(resultado.concluida).toBe(false);
      expect(resultado.dataConclusao).toBeNull();
      expect(mockPendenciaRepository.save).toHaveBeenCalledWith(merged);
    });
  });

  describe('delete', () => {
    it('deve deletar uma pendência existente', async () => {
      mockPendenciaRepository.findOne.mockResolvedValue({ id: 1 });
      mockPendenciaRepository.delete.mockResolvedValue({ affected: 1 });

      const resultado = await service.delete(1);

      expect(resultado).toEqual({ affected: 1 });
      expect(mockPendenciaRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
