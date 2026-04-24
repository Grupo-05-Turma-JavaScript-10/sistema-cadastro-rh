import { Test, TestingModule } from '@nestjs/testing';
import { HistoricoService } from './historico.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HistoricoColaborador } from '../entities/historico.entity';
import { Colaborador } from '../../colaborador/entities/colaborador.entity';
import { Cargo } from '../../cargo/entities/cargo.entity';

const mockHistoricoRepository = {
  save: jest.fn(),
  find: jest.fn(),
};

describe('HistoricoService', () => {
  let service: HistoricoService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoricoService,
        {
          provide: getRepositoryToken(HistoricoColaborador),
          useValue: mockHistoricoRepository,
        },
      ],
    }).compile();

    service = module.get<HistoricoService>(HistoricoService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('registrarHistorico', () => {
    it('deve registrar um novo histórico para o colaborador', async () => {
      const colaboradorMock = { id: 1 } as Colaborador;
      const cargoAnteriorMock = { id: 1, descricao: 'Jr' } as Cargo;
      const cargoNovoMock = { id: 2, descricao: 'Pleno' } as Cargo;
      const salarioAnterior = 3000;
      const salarioNovo = 5000;
      const motivo = 'Promoção';

      mockHistoricoRepository.save.mockResolvedValue({
        id: 1,
        colaborador: colaboradorMock,
        cargoAnterior: cargoAnteriorMock,
        cargoNovo: cargoNovoMock,
        salarioAnterior,
        salarioNovo,
        motivo,
      });

      const resultado = await service.registrarHistorico(
        colaboradorMock,
        cargoAnteriorMock,
        cargoNovoMock,
        salarioAnterior,
        salarioNovo,
        motivo,
      );

      expect(resultado).toBeDefined();
      expect(resultado.motivo).toBe('Promoção');
      expect(mockHistoricoRepository.save).toHaveBeenCalled();
    });
  });

  describe('findByColaboradorId', () => {
    it('deve retornar os históricos ordenados por data', async () => {
      const mockHistoricos = [
        { id: 1, motivo: 'Admissão', dataAlteracao: new Date() },
      ];
      mockHistoricoRepository.find.mockResolvedValue(mockHistoricos);

      const resultado = await service.findByColaboradorId(1);

      expect(resultado).toEqual(mockHistoricos);
      expect(mockHistoricoRepository.find).toHaveBeenCalledWith({
        where: { colaborador: { id: 1 } },
        relations: { cargoAnterior: true, cargoNovo: true },
        order: { dataAlteracao: 'DESC' },
      });
    });
  });
});
