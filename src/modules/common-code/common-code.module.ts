import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonCodeEntity } from './entities/common-code.entity';
import { CommonCodeResolver } from './common-code.resolver';
import { CommonCodeService } from './common-code.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommonCodeEntity])],
  providers: [CommonCodeResolver, CommonCodeService],
})
export class CommonCodeModule {}
