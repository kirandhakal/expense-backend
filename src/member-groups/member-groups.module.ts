import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberGroup } from '../database/entities';
import { MemberGroupsService } from './member-groups.service';
import { MemberGroupsResolver } from './member-groups.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([MemberGroup])],
  providers: [MemberGroupsService, MemberGroupsResolver],
})
export class MemberGroupsModule {}
