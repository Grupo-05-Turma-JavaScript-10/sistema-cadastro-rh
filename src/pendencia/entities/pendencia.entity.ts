import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Colaborador } from '../../colaborador/entities/colaborador.entity';

@Entity({ name: 'tb_pendencias' })
export class Pendencia {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @Column({ length: 255, nullable: false })
  titulo: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @Column({ type: 'boolean', default: true })
  obrigatoria: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  concluida: boolean;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @Column({ length: 1000, nullable: true })
  observacao?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @Column({ type: 'timestamp', nullable: true })
  dataConclusao?: Date | null;

  @ApiProperty({ type: () => Colaborador })
  @ManyToOne(() => Colaborador, (colaborador) => colaborador.pendencias, {
    onDelete: 'CASCADE',
  })
  colaborador: Colaborador;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
