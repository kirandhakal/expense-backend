import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SoftDeleteEntity } from './base.entity';
import { Workspace } from './workspace.entity';
import { HouseholdMember } from './household-member.entity';
import GraphQLJSON from 'graphql-type-json';

export enum ReminderChannel {
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
}

export enum ReminderTarget {
  RENT = 'rent',
  BILLS = 'bills',
  EMI = 'emi',
  LOAN = 'loan',
  SAVINGS = 'savings',
  INVESTMENTS = 'investments',
  TAX = 'tax',
  SUBSCRIPTION_RENEWAL = 'subscription_renewal',
  INSURANCE_RENEWAL = 'insurance_renewal',
}

export enum ReminderTiming {
  SAME_DAY = 'same_day',
  ONE_DAY_BEFORE = 'one_day_before',
  THREE_DAYS_BEFORE = 'three_days_before',
  SEVEN_DAYS_BEFORE = 'seven_days_before',
  CUSTOM = 'custom',
}

export enum ReminderAssignee {
  SELF = 'self',
  WIFE = 'wife',
  HUSBAND = 'husband',
  PARENTS = 'parents',
  CHILDREN = 'children',
  EVERYONE = 'everyone',
  CUSTOM_MEMBER = 'custom_member',
}

registerEnumType(ReminderChannel, { name: 'ReminderChannel' });
registerEnumType(ReminderTarget, { name: 'ReminderTarget' });
registerEnumType(ReminderTiming, { name: 'ReminderTiming' });
registerEnumType(ReminderAssignee, { name: 'ReminderAssignee' });

@ObjectType()
@Entity('reminder_settings')
export class ReminderSetting extends SoftDeleteEntity {
  @Field(() => [ReminderChannel])
  @Column({ type: 'simple-array' })
  channels: ReminderChannel[];

  @Field(() => ReminderTarget)
  @Column({ type: 'enum', enum: ReminderTarget })
  target: ReminderTarget;

  @Field(() => ReminderTiming)
  @Column({ type: 'enum', enum: ReminderTiming, default: ReminderTiming.ONE_DAY_BEFORE })
  timing: ReminderTiming;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'int', nullable: true })
  customDaysBefore?: number;

  @Field(() => ReminderAssignee)
  @Column({ type: 'enum', enum: ReminderAssignee, default: ReminderAssignee.SELF })
  assignTo: ReminderAssignee;

  @ManyToOne(() => HouseholdMember, { nullable: true, onDelete: 'SET NULL' })
  customMember?: HouseholdMember;

  @Field({ nullable: true })
  @Column({ nullable: true })
  customMemberId?: string;

  @Field()
  @Column({ default: true })
  enabled: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Workspace;

  @Field()
  @Column()
  workspaceId: string;
}
