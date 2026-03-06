import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserUpsertInput } from './dto/user.input';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  /** 목록 조회 */
  async findAll(keyword?: string, dept?: string): Promise<UserEntity[]> {
    const qb = this.repo.createQueryBuilder('u');
    if (keyword) {
      qb.andWhere('(u.id LIKE :kw OR u.name LIKE :kw)', { kw: `%${keyword}%` });
    }
    if (dept) {
      qb.andWhere('u.dept = :dept', { dept });
    }
    qb.orderBy('u.reg_dt', 'DESC');
    return qb.getMany();
  }

  /** 단건 조회 (myProfile 및 상세 조회 공용) */
  async findOne(id: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  /** 저장 및 수정 */
  async upsert(input: UserUpsertInput): Promise<UserEntity> {
    const existing = await this.repo.findOne({ where: { id: input.id } });
    if (existing) {
      this.repo.merge(existing, {
        ...input,
        mod_id: 'SYSTEM',
        mod_dt: new Date(),
      });
      return this.repo.save(existing);
    }
    const newUser = this.repo.create({
      ...input,
      reg_id: 'SYSTEM',
      mod_id: 'SYSTEM',
    });
    return this.repo.save(newUser);
  }

  /** 삭제 */
  async remove(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}
