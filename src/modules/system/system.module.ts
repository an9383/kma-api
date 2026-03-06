import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuEntity } from './entities/menu.entity';
import { MenuResolver } from './menu.resolver';
import { MenuService } from './menu.service';

@Module({
  imports: [TypeOrmModule.forFeature([MenuEntity])],
  providers: [MenuResolver, MenuService],
})
export class SystemModule {}
