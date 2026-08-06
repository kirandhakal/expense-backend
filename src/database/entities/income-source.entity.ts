import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from './base.entity';
import { Workspace } from './workspace.entity';

@ObjectType()
@Entity('income_sources')
export class IncomeSource extends BaseEntity {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  slug: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  icon?: string;

  @Field()
  @Column({ default: true })
  isDefault: boolean;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;
}
