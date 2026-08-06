import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, Float, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SoftDeleteEntity } from './base.entity';
import { Workspace } from './workspace.entity';
import { Category } from './category.entity';
import { PaymentMethod } from './payment-method.entity';
import { IncomeFrequency } from './income-stream.entity';

export enum RecurringDirection {
  INCOME = 'income',
  EXPENSE = 'expense',
}

registerEnumType(RecurringDirection, { name: 'RecurringDirection' });

@ObjectType()
@Entity('recurring_transactions')
export class RecurringTransaction extends SoftDeleteEntity {
  @Field()
  @Column()
  name: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Field(() => IncomeFrequency)
  @Column({ type: 'enum', enum: IncomeFrequency })
  frequency: IncomeFrequency;

  @Field()
  @Column({ type: 'date' })
  startDate: string;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  reminderBeforeDays?: number;

  @Field()
  @Column({ default: true })
  autoCreate: boolean;

  @Field(() => RecurringDirection)
  @Column({ type: 'enum', enum: RecurringDirection })
  direction: RecurringDirection;

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  category?: Category;

  @Field({ nullable: true })
  @Column({ nullable: true })
  categoryId?: string;

  @ManyToOne(() => PaymentMethod, { nullable: true, onDelete: 'SET NULL' })
  paymentMethod?: PaymentMethod;

  @Field({ nullable: true })
  @Column({ nullable: true })
  paymentMethodId?: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;
}
