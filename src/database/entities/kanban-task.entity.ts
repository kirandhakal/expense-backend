import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SoftDeleteEntity } from './base.entity';
import { Workspace } from './workspace.entity';
import { User } from './user.entity';
import { KanbanColumn } from './kanban-column.entity';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

registerEnumType(TaskPriority, { name: 'TaskPriority' });

@ObjectType()
@Entity('kanban_tasks')
export class KanbanTask extends SoftDeleteEntity {
  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => TaskPriority)
  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true })
  dueDate?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  dueTime?: string;

  @Field(() => [String])
  @Column('simple-array', { default: '' })
  tags: string[];

  @Field()
  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => KanbanColumn, { onDelete: 'CASCADE' })
  column: KanbanColumn;

  @Field()
  @Column()
  columnId: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  assignee?: User;

  @Field({ nullable: true })
  @Column({ nullable: true })
  assigneeId?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  createdBy: User;

  @Column()
  createdById: string;
}
