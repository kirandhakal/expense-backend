import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { BaseEntity } from './base.entity';
import { Workspace } from './workspace.entity';

export enum CategoryKind {
  EXPENSE = 'expense',
  INCOME = 'income',
}

registerEnumType(CategoryKind, { name: 'CategoryKind' });

@ObjectType()
@Entity('categories')
export class Category extends BaseEntity {
  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  slug: string;

  @Field()
  @Column({ default: '#6366f1' })
  color: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  icon?: string;

  @Field()
  @Column({ default: true })
  isDefault: boolean;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field(() => CategoryKind)
  @Column({ type: 'enum', enum: CategoryKind, default: CategoryKind.EXPENSE })
  kind: CategoryKind;

  @Field({ nullable: true })
  @Column({ nullable: true })
  parentId?: string;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  parent?: Category;

  @ManyToOne(() => Workspace, (workspace) => workspace.categories, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;
}
