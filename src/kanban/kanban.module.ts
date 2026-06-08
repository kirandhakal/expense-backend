import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KanbanColumn, KanbanTask } from '../database/entities';
import { KanbanService } from './kanban.service';
import { KanbanResolver } from './kanban.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([KanbanTask, KanbanColumn])],
  providers: [KanbanService, KanbanResolver],
})
export class KanbanModule {}
