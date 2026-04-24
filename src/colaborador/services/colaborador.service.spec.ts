import { Test, TestingModule } from '@nestjs/testing';
import { ColaboradorService } from './colaborador.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Colaborador } from '../entities/colaborador.entity';
import { HistoricoService } from '../../historico/services/historico.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ILike } from 'typeorm';

const mockColaboradorRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  update: jest.fn(),
};

const mockHistoricoService = {
  registrarHistorico: jest.fn(),
};

describe('ColaboradorService', () => {
  let service: ColaboradorService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColaboradorService,
        {
          provide: getRepositoryToken(Colaborador),
          useValue: mockColaboradorRepository,
        },
        {
          provide: HistoricoService,
          useValue: mockHistoricoService,
        },
      ],
    }).compile();

    service = module.get<ColaboradorService>(ColaboradorService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('calcularSalario', () => {
    it('deve calcular e atualizar o salário', async () => {
      mockColaboradorRepository.update.mockResolvedValue({});

      const resultado = await service.calcularSalario(1, 160, 50, 1000, 200); // 160 * 50 + 1000 - 200 = 8800

      expect(resultado).toBe(8800);
      expect(mockColaboradorRepository.update).toHaveBeenCalledWith(1, { salario: 8800 });
    });
  });

  describe('adicionarCamposCalculados', () => {
    it('deve calcular os encargos para CLT', async () => {
      const mockColaborador = { id: 1, salario: 5000, tipoContrato: 'CLT', pacoteBeneficio: { valorTotal: 500 } };
      mockColaboradorRepository.find.mockResolvedValue([mockColaborador]);

      const [resultado] = await service.findAll();

      expect(resultado.encargos).toBe(3400); // 5000 * 0.68
      expect(resultado.custoTotal).toBe(8900); // 5000 + 3400 + 500
    });

    it('deve calcular os encargos para ESTAGIO', async () => {
      const mockColaborador = { id: 1, salario: 2000, tipoContrato: 'ESTAGIO' };
      mockColaboradorRepository.findOne.mockResolvedValue(mockColaborador);

      const resultado = await service.findById(1);

      expect(resultado.encargos).toBe(166.6); // 2000 * 0.0833
      expect(resultado.custoTotal).toBe(2166.6); // 2000 + 166.6
    });

    it('deve calcular os encargos para PJ', async () => {
      const mockColaborador = { id: 1, salario: 10000, tipoContrato: 'PJ' };
      mockColaboradorRepository.findOne.mockResolvedValue(mockColaborador);

      const resultado = await service.findById(1);

      expect(resultado.encargos).toBe(0);
      expect(resultado.custoTotal).toBe(10000);
    });
  });

  describe('findById', () => {
    it('deve lançar HttpException 404 se não for encontrado', async () => {
      mockColaboradorRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow(
        new HttpException('Colaborador não encontrado', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('create', () => {
    it('deve calcular as datas automaticamente com base na data de admissão', async () => {
      const dataAdmissaoStr = '2023-01-01T00:00:00.000Z';
      const novoColaborador = { nome: 'João', data_admissao: new Date(dataAdmissaoStr) } as Colaborador;
      mockColaboradorRepository.save.mockResolvedValue(novoColaborador);

      await service.create(novoColaborador);

      // Espera-se que as datas sejam preenchidas antes de salvar
      expect(mockColaboradorRepository.save).toHaveBeenCalled();
      const salvo = mockColaboradorRepository.save.mock.calls[0][0];
      
      expect(salvo.dataFimExperiencia).toBeDefined();
      expect(salvo.dataVencimentoAso).toBeDefined();
      expect(salvo.dataLimiteFerias).toBeDefined();
    });
  });

  describe('uptade', () => {
    it('deve atualizar o colaborador sem registrar histórico se cargo/salario não mudarem', async () => {
      const colabExistente = { id: 1, salario: 3000, cargo: { id: 1 } };
      const colabAtualizado = { id: 1, salario: 3000, cargo: { id: 1 }, nome: 'Nome Novo' } as unknown as Colaborador;
      
      mockColaboradorRepository.findOne.mockResolvedValue(colabExistente);
      mockColaboradorRepository.save.mockResolvedValue(colabAtualizado);

      await service.uptade(colabAtualizado);

      expect(mockHistoricoService.registrarHistorico).not.toHaveBeenCalled();
      expect(mockColaboradorRepository.save).toHaveBeenCalledWith(colabAtualizado);
    });

    it('deve registrar histórico se o cargo for alterado', async () => {
      const colabExistente = { id: 1, salario: 3000, cargo: { id: 1 } };
      const colabAtualizado = { id: 1, salario: 3000, cargo: { id: 2 } } as unknown as Colaborador;
      
      mockColaboradorRepository.findOne.mockResolvedValue(colabExistente);
      mockColaboradorRepository.save.mockResolvedValue(colabAtualizado);

      await service.uptade(colabAtualizado);

      expect(mockHistoricoService.registrarHistorico).toHaveBeenCalled();
    });
  });

  describe('getAlertasVencimentos', () => {
    it('deve retornar alertas para colaboradores com datas próximas de vencimento', async () => {
      const hoje = new Date();
      const daquiA10Dias = new Date();
      daquiA10Dias.setDate(hoje.getDate() + 10);

      const mockColaborador = { id: 1, nome: 'João', status: true, dataFimExperiencia: daquiA10Dias };
      mockColaboradorRepository.find.mockResolvedValue([mockColaborador]);

      const alertas = await service.getAlertasVencimentos(30);

      expect(alertas.length).toBe(1);
      expect(alertas[0].tipoAlerta).toBe('Experiência vencendo');
      expect(alertas[0].diasRestantes).toBe(10);
    });
  });
});
