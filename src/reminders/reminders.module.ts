import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReminderSetting } from '../database/entities';
import { RemindersService } from './reminders.service';
import { RemindersResolver } from './reminders.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ReminderSetting])],
  providers: [RemindersService, RemindersResolver],
  exports: [RemindersService],
})
export class RemindersModule {}
