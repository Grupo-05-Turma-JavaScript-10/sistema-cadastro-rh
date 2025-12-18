import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsNotEmpty, IsNumber, IsBoolean, IsEmail } from 'class-validator';

@Entity({ name: 'tb_colaboradores' })
export class Colaborador {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column({ length: 255, nullable: false })
  nome: string;

  @IsNotEmpty()
  @Column({ length: 14, nullable: false })
  cpf: string;

  @IsNotEmpty()
  @IsEmail()
  @Column({ length: 255, nullable: false })
  email: string;

  @IsNotEmpty()
  @Column({ type: 'date' })
  data_admissao: Date;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salario: number;

  @IsBoolean()
  @Column({ type: 'boolean' })
  status: boolean;
}
