import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from './base.entity';
import { Workspace } from './workspace.entity';

@ObjectType()
@Entity('kanban_columns')
export class KanbanColumn extends BaseEntity {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  slug: string;

  @Field()
  @Column({ default: 0 })
  order: number;

  @Field()
  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;
}
