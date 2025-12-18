import { IsNotEmpty } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Colaborador } from '../../colaborador/entities/colaborador.entity';

@Entity({ name: 'tb_cargos' })
export class Cargo {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column({ length: 255, nullable: false })
  nome: string;

  @IsNotEmpty()
  @Column()
  descricao: string;

  @OneToMany(() => Colaborador, (colaborador) => colaborador.cargo)
  colaborador: Colaborador[];
}
