import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoomEntity } from './entities/chatroom.entity'; 
import { ChatRoomResolver } from './chatroom.resolver';
import { ChatRoomService } from './chatroom.service';
import { ChatRoomController } from './chatroom.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoomEntity]), HttpModule], 
  controllers: [ChatRoomController],
  providers: [ChatRoomResolver, ChatRoomService],
  exports: [ChatRoomService],
})
export class ChatRoomModule {}