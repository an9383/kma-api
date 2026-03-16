import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatBotEntity } from './entities/chatbot.entity'; 
import { ChatBotResolver } from './chatbot.resolver';
import { ChatBotService } from './chatbot.service';
import { ChatBotController } from './chatbot.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChatBotEntity])], 
  controllers: [ChatBotController],
  providers: [ChatBotResolver, ChatBotService],
  exports: [ChatBotService],
})
export class ChatBotModule {}