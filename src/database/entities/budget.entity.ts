import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SoftDeleteEntity } from './base.entity';
import { Workspace } from './workspace.entity';
import { Category } from './category.entity';

export enum BudgetType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CATEGORY = 'category',
}

export enum BudgetStrategy {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  ZERO_BASED = 'zero_based',
  ENVELOPE = 'envelope',
}

registerEnumType(BudgetType, { name: 'BudgetType' });
registerEnumType(BudgetStrategy, { name: 'BudgetStrategy' });

@ObjectType()
@Entity('budgets')
export class Budget extends SoftDeleteEntity {
  @Field(() => BudgetType)
  @Column({ type: 'enum', enum: BudgetType })
  type: BudgetType;

  @Field(() => BudgetStrategy)
  @Column({ type: 'enum', enum: BudgetStrategy, default: BudgetStrategy.FIXED })
  strategy: BudgetStrategy;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true })
  periodStart?: string;

  @Field({ nullable: true })
  @Column({ type: 'date', nullable: true })
  periodEnd?: string;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  category?: Category;

  @Field({ nullable: true })
  @Column({ nullable: true })
  categoryId?: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;
}
