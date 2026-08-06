import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HouseholdMember } from '../database/entities';
import { HouseholdMembersService } from './household-members.service';
import { HouseholdMembersResolver } from './household-members.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([HouseholdMember])],
  providers: [HouseholdMembersService, HouseholdMembersResolver],
  exports: [HouseholdMembersService],
})
export class HouseholdMembersModule {}
