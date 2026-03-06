import { Query, Resolver } from '@nestjs/graphql';
import { MenuEntity } from './entities/menu.entity';
import { MenuService } from './menu.service';

@Resolver(() => MenuEntity)
export class MenuResolver {
  constructor(private readonly menuService: MenuService) {}

  @Query(() => [MenuEntity], { name: 'menuList' })
  async getMenuList() {
    return this.menuService.getTreeList();
  }
}
