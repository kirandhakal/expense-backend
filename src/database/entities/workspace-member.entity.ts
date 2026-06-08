import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Workspace } from './workspace.entity';
import { Role } from './role.entity';

@ObjectType()
@Entity('workspace_members')
export class WorkspaceMember extends BaseEntity {
  @ManyToOne(() => User, (user) => user.workspaceMemberships, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Field()
  @Column()
  userId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.members, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;

  @ManyToOne(() => Role, (role) => role.members, { onDelete: 'RESTRICT' })
  role: Role;

  @Field()
  @Column()
  roleId: string;

  @Field()
  @Column({ default: true })
  isActive: boolean;
}
