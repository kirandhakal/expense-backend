import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SoftDeleteEntity } from './base.entity';
import { Workspace } from './workspace.entity';
import { User } from './user.entity';
import { Category } from './category.entity';
import { PaymentMethod } from './payment-method.entity';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
  LOAN_GIVEN = 'loan_given',
  LOAN_RECEIVED = 'loan_received',
  BORROWED = 'borrowed',
  RETURNED = 'returned',
  INVESTMENT = 'investment',
  SAVINGS = 'savings',
  REFUND = 'refund',
  CASH_WITHDRAWAL = 'cash_withdrawal',
  CASH_DEPOSIT = 'cash_deposit',
  ADJUSTMENT = 'adjustment',
  OTHER = 'other',
}

registerEnumType(TransactionType, { name: 'TransactionType' });

@ObjectType()
@Entity('transactions')
export class Transaction extends SoftDeleteEntity {
  @Field()
  @Column()
  name: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Field(() => TransactionType)
  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Field()
  @Column({ type: 'date' })
  date: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.transactions, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;

  @Field(() => Category)
  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  category: Category;

  @Field()
  @Column()
  categoryId: string;

  @Field(() => PaymentMethod, { nullable: true })
  @ManyToOne(() => PaymentMethod, { nullable: true, onDelete: 'SET NULL' })
  paymentMethod?: PaymentMethod;

  @Field({ nullable: true })
  @Column({ nullable: true })
  paymentMethodId?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  member?: User;

  @Field({ nullable: true })
  @Column({ nullable: true })
  memberId?: string;

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  createdBy: User;

  @Column()
  createdById: string;
}
