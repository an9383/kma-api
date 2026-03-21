import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatBotEntity } from './entities/chatbot.entity'; 
import { ChatRoomEntity } from '../chat-room/entities/chatroom.entity';
import { ChatBotResolver } from './chatbot.resolver';
import { ChatBotService } from './chatbot.service';
import { ChatBotController } from './chatbot.controller';
import { HttpModule } from '@nestjs/axios'; 

@Module({
  imports: [TypeOrmModule.forFeature([ChatBotEntity, ChatRoomEntity]), HttpModule], 
  controllers: [ChatBotController],
  providers: [ChatBotResolver, ChatBotService],
  exports: [ChatBotService],
})
export class ChatBotModule {}