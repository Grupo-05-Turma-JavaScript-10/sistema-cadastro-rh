import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Colaborador } from '../../colaborador/entities/colaborador.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'tb_cargos' })
export class Cargo {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @Column({ length: 255, nullable: false })
  @ApiProperty()
  nome: string;

  @IsNotEmpty()
  @Column()
  @ApiProperty()
  descricao: string;

  @ApiProperty()
  @OneToMany(() => Colaborador, (colaborador) => colaborador.cargo)
  colaborador: Colaborador[];
}
