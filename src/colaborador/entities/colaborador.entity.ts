import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { IsNotEmpty, IsNumber, IsBoolean, IsEmail, IsString, IsIn } from 'class-validator';
import { Cargo } from '../../cargo/entities/cargo.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Pendencia } from '../../pendencia/entities/pendencia.entity';
import { HistoricoColaborador } from '../../historico/entities/historico.entity';
import { PacoteBeneficio } from '../../pacote-beneficio/entities/pacote-beneficio.entity';

@Entity({ name: 'tb_colaboradores' })
export class Colaborador {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @Column({ length: 255, nullable: false })
  nome: string;

  @ApiProperty()
  @IsNotEmpty()
  @Column({ length: 14, nullable: false })
  cpf: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Column({ length: 255, nullable: false })
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @Column({ type: 'date' })
  data_admissao: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salario: number;

  @ApiProperty({ description: 'CLT, PJ, ESTAGIO' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['CLT', 'PJ', 'ESTAGIO'])
  @Column({ length: 50, default: 'CLT' })
  tipoContrato: string;

  @ApiProperty()
  @IsBoolean()
  @Column({ type: 'boolean' })
  status: boolean;

  @ApiProperty({ type: () => Cargo })
  @ManyToOne(() => Cargo, (cargo) => cargo.colaborador, {
    onDelete: 'CASCADE',
  })
  cargo: Cargo;

  @ApiProperty({ type: () => Usuario })
  @ManyToOne(() => Usuario, (usuario) => usuario.colaborador, {
    onDelete: 'CASCADE',
  })
  usuario: Usuario;

  @ApiProperty({ required: false, nullable: true })
  @Column({ type: 'date', nullable: true })
  dataFimExperiencia: Date;

  @ApiProperty({ required: false, nullable: true })
  @Column({ type: 'date', nullable: true })
  dataVencimentoAso: Date;

  @ApiProperty({ required: false, nullable: true })
  @Column({ type: 'date', nullable: true })
  dataLimiteFerias: Date;

  @ApiProperty({ type: () => Pendencia, isArray: true })
  @OneToMany(() => Pendencia, (pendencia) => pendencia.colaborador)
  pendencias: Pendencia[];

  @ApiProperty({ type: () => HistoricoColaborador, isArray: true })
  @OneToMany(() => HistoricoColaborador, (historico) => historico.colaborador)
  historico: HistoricoColaborador[];

  @ApiProperty({ type: () => PacoteBeneficio, required: false, nullable: true })
  @ManyToOne(() => PacoteBeneficio, (pacote) => pacote.colaboradores, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  pacoteBeneficio: PacoteBeneficio;
}
