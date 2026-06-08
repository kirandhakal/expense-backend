import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, Float, ObjectType } from '@nestjs/graphql';
import { SoftDeleteEntity } from './base.entity';
import { User } from './user.entity';
import { Workspace } from './workspace.entity';

@ObjectType()
@Entity('sticky_notes')
export class StickyNote extends SoftDeleteEntity {
  @Field()
  @Column()
  content: string;

  @Field()
  @Column({ default: '#fef08a' })
  color: string;

  @Field(() => Float)
  @Column({ type: 'float', default: 100 })
  x: number;

  @Field(() => Float)
  @Column({ type: 'float', default: 100 })
  y: number;

  @Field()
  @Column({ default: 'global' })
  page: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;
}
