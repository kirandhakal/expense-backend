import { Column, Entity, ManyToOne } from 'typeorm';
import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SoftDeleteEntity } from './base.entity';
import { Workspace } from './workspace.entity';
import { User } from './user.entity';
import { Category } from './category.entity';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
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

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  category: Category;

  @Field()
  @Column()
  categoryId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  member?: User;

  @Field({ nullable: true })
  @Column({ nullable: true })
  memberId?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  createdBy: User;

  @Column()
  createdById: string;
}
