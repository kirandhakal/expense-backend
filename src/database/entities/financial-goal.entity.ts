import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SoftDeleteEntity } from './base.entity';
import { Workspace } from './workspace.entity';
import { User } from './user.entity';

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
}

registerEnumType(GoalStatus, { name: 'GoalStatus' });

@ObjectType()
@Entity('financial_goals')
export class FinancialGoal extends SoftDeleteEntity {
  @Field()
  @Column()
  title: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  targetAmount: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  currentAmount: number;

  @Field()
  @Column({ type: 'date' })
  deadline: string;

  @Field(() => GoalStatus)
  @Column({ type: 'enum', enum: GoalStatus, default: GoalStatus.ACTIVE })
  status: GoalStatus;

  @Field()
  @Column()
  category: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  createdBy: User;

  @Column()
  createdById: string;
}
