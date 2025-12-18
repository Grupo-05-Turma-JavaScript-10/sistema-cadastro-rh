import { Module } from '@nestjs/common';
import { Bcrypt } from './bycript/bycript';

@Module({
  imports: [],
  providers: [Bcrypt],
  controllers: [],
  exports: [Bcrypt],
})
export class AuthModule {}
