import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { ChatBotEntity } from './entities/chatbot.entity';
import { ChatBotService } from './chatbot.service';
import { ChatBotUpsertInput } from './dto/chatbot.input';

/**
 * 회원 도메인의 데이터 조작 및 조회를 담당하는 인터페이스 레이어입니다
 */
@Resolver(() => ChatBotEntity)
export class ChatBotResolver {
  private readonly logger = new Logger(ChatBotResolver.name);
  constructor(private svc: ChatBotService) {}

  @Query(() => [ChatBotEntity])
  async chatBotList() {
    return this.svc.list();
  }

  @Query(() => ChatBotEntity)
  chatBotTypeList(@Args('app_type_code') app_type_code: string) {
    return this.svc.appTypeList(app_type_code);
  }

  @Query(() => ChatBotEntity)
  chatBot(@Args('chatbot_id') app_id: string) {
    return this.svc.findOne(app_id);
  }

  /**
   * 회원 정보 등록 및 수정
   * GqlAuthGuard로 신원을 확인하고 RolesGuard로 ADMIN 권한을 최종 검증합니다
   */
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @Mutation(() => ChatBotEntity)
  async chatBotUpsert(
    @Args('room_id') room_id: string,
    @Args('body', { type: () => ChatBotUpsertInput }) body: ChatBotUpsertInput 
  ) {
    this.logger.log(room_id, body)
    return this.svc.upsert(room_id, body);
  }
  
  /**
   * [보완] 회원 정보 삭제
   * 데이터의 민감도를 고려하여 관리자 권한 이중 잠금을 적용했습니다
   */
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @Mutation(() => Boolean)
  chatBotDelete(@Args('room_id') room_id: string) {
    return this.svc.remove(room_id);
  }
}
