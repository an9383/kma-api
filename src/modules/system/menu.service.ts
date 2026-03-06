import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuEntity } from './entities/menu.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuEntity)
    private readonly menuRepo: Repository<MenuEntity>,
  ) {}

  async getTreeList(): Promise<MenuEntity[]> {
    // 모든 사용가능한 메뉴 로드
    const allMenus = await this.menuRepo.find({
      where: { useYn: 'Y' },
      order: { sort: 'ASC' },
    });

    // DB 컬럼을 FE MenuItemType 규격(id, label)으로 매핑하며 Tree 구조 생성
    const menuMap = new Map<string, MenuEntity>();
    const tree: MenuEntity[] = [];

    allMenus.forEach((m) => {
      m.id = m.menuId;
      m.label = m.menuNm;
      m.children = [];
      menuMap.set(m.menuId, m);
    });

    allMenus.forEach((m) => {
      if (m.upId && menuMap.has(m.upId)) {
        menuMap.get(m.upId)?.children?.push(m);
      } else {
        tree.push(m);
      }
    });

    return tree;
  }
}
