import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SoftDeleteEntity } from './base.entity';
import { Workspace } from './workspace.entity';
import { IncomeSource } from './income-source.entity';

export enum IncomeFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  HALF_YEARLY = 'half_yearly',
  YEARLY = 'yearly',
  FREELANCE = 'freelance',
  SEASONAL = 'seasonal',
  ONE_TIME = 'one_time',
  CUSTOM = 'custom',
}

registerEnumType(IncomeFrequency, { name: 'IncomeFrequency' });

@ObjectType()
@Entity('income_streams')
export class IncomeStream extends SoftDeleteEntity {
  @Field(() => Float)
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  expectedAmount: number;

  @Field(() => IncomeFrequency)
  @Column({ type: 'enum', enum: IncomeFrequency })
  frequency: IncomeFrequency;

  @Field()
  @Column({ type: 'date' })
  startDate: string;

  @Field()
  @Column({ default: false })
  autoRecord: boolean;

  @ManyToOne(() => IncomeSource, { onDelete: 'CASCADE' })
  @Field(() => IncomeSource)
  incomeSource: IncomeSource;

  @Field()
  @Column()
  incomeSourceId: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;
}
