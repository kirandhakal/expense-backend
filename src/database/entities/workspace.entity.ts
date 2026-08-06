import { Column, Entity, OneToMany } from 'typeorm';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SoftDeleteEntity } from './base.entity';
import { WorkspaceMember } from './workspace-member.entity';
import { Transaction } from './transaction.entity';
import { Category } from './category.entity';
import { Role } from './role.entity';
import GraphQLJSON from 'graphql-type-json';

export enum WorkspaceType {
  PERSONAL = 'personal',
  COUPLE = 'couple',
  FAMILY = 'family',
  BUSINESS = 'business',
  SHARED_FLAT = 'shared_flat',
  /** @deprecated use BUSINESS */
  ORGANIZATION = 'organization',
}

registerEnumType(WorkspaceType, { name: 'WorkspaceType' });

@ObjectType()
@Entity('workspaces')
export class Workspace extends SoftDeleteEntity {
  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => WorkspaceType)
  @Column({ type: 'enum', enum: WorkspaceType })
  type: WorkspaceType;

  @Field()
  @Column({ default: 'USD' })
  currency: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  fiscalYearStart?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  fiscalYearEnd?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  settings?: Record<string, unknown>;

  @OneToMany(() => WorkspaceMember, (member) => member.workspace)
  members: WorkspaceMember[];

  @OneToMany(() => Transaction, (transaction) => transaction.workspace)
  transactions: Transaction[];

  @OneToMany(() => Category, (category) => category.workspace)
  categories: Category[];

  @OneToMany(() => Role, (role) => role.workspace)
  roles: Role[];
}
