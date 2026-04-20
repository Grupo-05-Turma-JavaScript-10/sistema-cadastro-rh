import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Colaborador } from '../../colaborador/entities/colaborador.entity';

@Entity({ name: 'tb_pacotes_beneficios' })
export class PacoteBeneficio {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Column({ length: 255, nullable: false })
  nome: string;

  @ApiProperty()
  @IsString()
  @Column({ length: 1000, nullable: true })
  descricao: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valorTotal: number;

  @ApiProperty({ type: () => Colaborador, isArray: true })
  @OneToMany(() => Colaborador, (colaborador) => colaborador.pacoteBeneficio)
  colaboradores: Colaborador[];
}
