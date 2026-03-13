import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneralEntity } from './entities/general.entity'; 
import { GeneralResolver } from './general.resolver';
import { GeneralService } from './general.service';
import { GeneralController } from './general.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([GeneralEntity]), HttpModule], 
  controllers: [GeneralController],
  providers: [GeneralResolver, GeneralService],
  exports: [GeneralService],
})
export class GeneralModule {}