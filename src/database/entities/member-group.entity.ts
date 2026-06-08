import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from './base.entity';
import { Workspace } from './workspace.entity';
import { User } from './user.entity';

@ObjectType()
@Entity('member_groups')
export class MemberGroup extends BaseEntity {
  @Field()
  @Column()
  name: string;

  @Field(() => [String])
  @Column('simple-array')
  memberIds: string[];

  @Field()
  @Column({ default: '#6366f1' })
  color: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  createdBy: User;

  @Column()
  createdById: string;
}
