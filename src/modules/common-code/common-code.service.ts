import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { CommonCodeEntity } from './entities/common-code.entity';
import { CommonCodeUpsertInput } from './dto/common-code.input';

@Injectable()
export class CommonCodeService {
  private readonly log = new Logger(CommonCodeService.name);

  constructor(@InjectRepository(CommonCodeEntity) private repo: Repository<CommonCodeEntity>) {}

  async masterList() {
    return this.repo.find({ where: { upCd: IsNull() }, order: { sort: 'ASC' } });
  }

  async detailList(upCd: string) {
    const findUpCd = upCd?.trim() ? upCd : IsNull();
    return this.repo.find({ where: { upCd: findUpCd }, order: { sort: 'ASC' } });
  }

  async upsert(input: CommonCodeUpsertInput, userId: string) {
    let targetCd = input.comnCd?.trim();

    if (!targetCd || targetCd.startsWith('TEMP_')) {
      const maxEntity = await this.repo
        .createQueryBuilder('cd')
        .where('cd.comnCd LIKE :pattern', { pattern: 'com%' })
        .orderBy('cd.comnCd', 'DESC')
        .getOne();

      let nextNum = 1;
      if (maxEntity?.comnCd) {
        const numPart = maxEntity.comnCd.replace('com', '');
        const parsedNum = parseInt(numPart, 10);
        if (!isNaN(parsedNum)) nextNum = parsedNum + 1;
      }
      targetCd = `com${String(nextNum).padStart(5, '0')}`;
    }

    const existing = await this.repo.findOne({ where: { comnCd: targetCd } });

    if (existing) {
      this.repo.merge(existing, {
        ...input,
        comnCd: targetCd,
        upCd: input.upCd?.trim() || null,
        modId: userId,
        modDt: new Date(),
      });
      return await this.repo.save(existing);
    } else {
      const entity = this.repo.create({
        ...input,
        comnCd: targetCd,
        upCd: input.upCd?.trim() || null,
        sort: input.sort ?? 0,
        regId: userId,
        modId: userId,
        modDt: new Date(),
      });
      return await this.repo.save(entity);
    }
  }

  async remove(comnCd: string) {
    const found = await this.repo.findOne({ where: { comnCd } });
    if (!found) return false;
    await this.repo.remove(found);
    return true;
  }

  async batchRemove(ids: string[]) {
    if (!ids?.length) return false;
    const result = await this.repo.delete({ comnCd: In(ids) });
    return (result.affected ?? 0) > 0;
  }
}
