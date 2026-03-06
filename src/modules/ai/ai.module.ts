import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiEntity } from '../ai/entities/ai.entity'; 
import { AiResolver } from './ai.resolver';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AiEntity])], 
  controllers: [AiController],
  providers: [AiResolver, AiService],
  exports: [AiService],
})
export class AiModule {}