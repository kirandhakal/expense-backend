import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SoftDeleteEntity } from './base.entity';
import { Workspace } from './workspace.entity';
import { User } from './user.entity';

export enum HouseholdMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

registerEnumType(HouseholdMemberRole, { name: 'HouseholdMemberRole' });

@ObjectType()
@Entity('household_members')
export class HouseholdMember extends SoftDeleteEntity {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  relationship: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phone?: string;

  @Field(() => HouseholdMemberRole)
  @Column({ type: 'enum', enum: HouseholdMemberRole, default: HouseholdMemberRole.MEMBER })
  roleKey: HouseholdMemberRole;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user?: User;

  @Field({ nullable: true })
  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;
}
