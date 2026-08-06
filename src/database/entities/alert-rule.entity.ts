import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SoftDeleteEntity } from './base.entity';
import { Workspace } from './workspace.entity';

export enum AlertType {
  EXPENSE_WARNING = 'expense_warning',
  INCOME_MISSING = 'income_missing',
  RECURRING_BILL = 'recurring_bill',
  BUDGET_EXCEEDED = 'budget_exceeded',
  LOW_WALLET_BALANCE = 'low_wallet_balance',
  LOW_BANK_BALANCE = 'low_bank_balance',
  LARGE_TRANSACTION = 'large_transaction',
  UNUSUAL_SPENDING = 'unusual_spending',
}

registerEnumType(AlertType, { name: 'AlertType' });

@ObjectType()
@Entity('alert_rules')
export class AlertRule extends SoftDeleteEntity {
  @Field(() => AlertType)
  @Column({ type: 'enum', enum: AlertType })
  type: AlertType;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  threshold?: number;

  @Field()
  @Column({ default: true })
  enabled: boolean;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;
}
