import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Invitation,
  Notification,
  Role,
  User,
  WorkspaceMember,
} from '../database/entities';
import { MembersService } from './members.service';
import { MembersResolver } from './members.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkspaceMember,
      Invitation,
      User,
      Role,
      Notification,
    ]),
  ],
  providers: [MembersService, MembersResolver],
  exports: [MembersService],
})
export class MembersModule {}
