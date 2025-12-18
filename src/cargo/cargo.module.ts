import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Cargo } from "./entities/cargo.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Cargo])],
    providers: [],
    controllers: [],
    exports: []
})

export class CargoModule { }