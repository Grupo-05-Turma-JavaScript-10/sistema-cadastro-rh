import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Colaborador } from '../../colaborador/entities/colaborador.entity';
import { Cargo } from '../../cargo/entities/cargo.entity';

@Entity({ name: 'tb_historico_colaborador' })
export class HistoricoColaborador {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: () => Colaborador })
  @ManyToOne(() => Colaborador, (colaborador) => colaborador.historico, {
    onDelete: 'CASCADE',
  })
  colaborador: Colaborador;

  @ApiProperty({ type: () => Cargo })
  @ManyToOne(() => Cargo, { onDelete: 'SET NULL', nullable: true })
  cargoAnterior: Cargo;

  @ApiProperty({ type: () => Cargo })
  @ManyToOne(() => Cargo, { onDelete: 'SET NULL', nullable: true })
  cargoNovo: Cargo;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salarioAnterior: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salarioNovo: number;

  @ApiProperty()
  @Column({ length: 255, nullable: true })
  motivo: string;

  @CreateDateColumn({ type: 'timestamp' })
  dataAlteracao: Date;
}
