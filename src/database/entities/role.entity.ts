import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from './base.entity';
import { Workspace } from './workspace.entity';
import { RolePermission } from './role-permission.entity';
import { WorkspaceMember } from './workspace-member.entity';

@ObjectType()
@Entity('roles')
export class Role extends BaseEntity {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ default: false })
  isSystem: boolean;

  @ManyToOne(() => Workspace, (workspace) => workspace.roles, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @Column()
  workspaceId: string;

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions: RolePermission[];

  @OneToMany(() => WorkspaceMember, (member) => member.role)
  members: WorkspaceMember[];
}
