import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Workspace } from '../database/entities';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User, Workspace]), JwtModule.register({})],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
