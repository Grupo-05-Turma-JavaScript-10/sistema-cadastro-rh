import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IsNotEmpty, IsNumber, IsBoolean, IsEmail } from 'class-validator';
import { Cargo } from '../../cargo/entities/cargo.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { ApiProperty } from '@nestjs/swagger';

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
}
