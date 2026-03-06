import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberEntity } from './entities/member.entity';
import { MemberSearchInput } from './dto/member.input';

@Injectable()
export class MemberService {
  private readonly log = new Logger(MemberService.name);

  constructor(@InjectRepository(MemberEntity) private repo: Repository<MemberEntity>) {}

  async list(input?: MemberSearchInput) {
    const qb = this.repo.createQueryBuilder('m');

    if (input) {
      const { keyword, startDate, endDate, areaDiv, payDiv, boardDiv } = input;

      if (keyword?.trim()) {
        qb.andWhere('(m.userId ILIKE :kw OR m.userName ILIKE :kw)', { kw: `%${keyword}%` });
      }

      if (startDate && endDate) {
        qb.andWhere('m.joinDate BETWEEN :start AND :end', {
          start: `${startDate} 00:00:00`,
          end: `${endDate} 23:59:59.999`,
        });
      }

      if (areaDiv) qb.andWhere('m.areaDiv = :areaDiv', { areaDiv });
      if (payDiv) qb.andWhere('m.payDiv = :payDiv', { payDiv });
      if (boardDiv) qb.andWhere('m.boardDiv = :boardDiv', { boardDiv });
    }

    qb.orderBy('m.joinDate', 'DESC');
    return await qb.getMany();
  }

  async findOne(userId: string) {
    return await this.repo.findOne({ where: { userId } });
  }

  /**
   * 정보를 저장하거나 수정하는 함수입니다.
   * merge 로직을 강화하여 특정 필드(content 등)의 누락을 방지합니다.
   */
  async upsert(input: any) {
    const existing = await this.repo.findOne({ where: { userId: input.userId } });

    // 디버깅을 위한 서버 로그 유지
    this.log.debug(`Upsert Input: ${JSON.stringify(input)}`);

    if (existing) {
      /**
       * 수정 시 병합 로직
       * 클라이언트에서 넘어온 content가 undefined가 아닐 때만 덮어쓰고,
       * 값이 없을 경우 기존 content를 유지합니다.
       */
      this.repo.merge(existing, {
        ...input,
        content: input.content !== undefined ? input.content : existing.content,
        modId: 'SYSTEM',
        modDt: new Date(),
      });
      return await this.repo.save(existing);
    } else {
      /**
       * 신규 등록 시 로직
       * content가 null/undefined일 경우 명시적으로 빈 문자열('')을 할당합니다.
       */
      const ent = this.repo.create({
        ...input,
        content: input.content ?? '',
        joinDate: new Date(),
        regId: 'SYSTEM',
        modId: 'SYSTEM',
      });
      return await this.repo.save(ent);
    }
  }

  async remove(userId: string) {
    const found = await this.findOne(userId);
    if (!found) return false;
    await this.repo.remove(found);
    return true;
  }
}
